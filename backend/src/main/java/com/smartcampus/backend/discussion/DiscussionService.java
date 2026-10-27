package com.smartcampus.backend.discussion;

import com.smartcampus.backend.common.security.CourseAccess;
import com.smartcampus.backend.discussion.DiscussionModels.*;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DiscussionService {
    private final JdbcTemplate jdbc;
    private final CourseAccess access;

    public DiscussionService(JdbcTemplate jdbc, CourseAccess access) {
        this.jdbc = jdbc;
        this.access = access;
    }

    public List<CommentView> list(Long courseId) {
        access.requireParticipant(courseId);
        return jdbc.query("""
                SELECT d.id, d.course_id, d.author_id, u.full_name, d.parent_id, d.content,
                       d.is_deleted, d.created_at, d.updated_at
                FROM course_discussions d JOIN users u ON u.id = d.author_id
                WHERE d.course_id = ? ORDER BY d.created_at, d.id
                """, (rs, row) -> new CommentView(rs.getLong("id"), rs.getLong("course_id"),
                rs.getLong("author_id"), rs.getString("full_name"),
                (Long) rs.getObject("parent_id"), rs.getString("content"),
                rs.getBoolean("is_deleted"), rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("updated_at").toLocalDateTime()), courseId);
    }

    @Transactional
    public CommentView create(Long courseId, CommentInput input) {
        access.requireParticipant(courseId);
        if (input.parentId() != null) {
            Integer count = jdbc.queryForObject("""
                    SELECT COUNT(*) FROM course_discussions
                    WHERE id = ? AND course_id = ? AND is_deleted = FALSE
                    """, Integer.class, input.parentId(), courseId);
            if (count == null || count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Parent comment not found in course");
        }
        GeneratedKeyHolder holder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    INSERT INTO course_discussions (course_id, author_id, parent_id, content)
                    VALUES (?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setLong(1, courseId);
            statement.setLong(2, access.userId());
            statement.setObject(3, input.parentId());
            statement.setString(4, input.content().trim());
            return statement;
        }, holder);
        return find(courseId, holder.getKey().longValue());
    }

    /** Only the author edits a comment; moderators (lecturer/admin) can delete it but not rewrite it. */
    @Transactional
    public CommentView edit(Long courseId, Long id, EditInput input) {
        access.requireParticipant(courseId);
        requireOwner(courseId, id);
        int updated = jdbc.update("""
                UPDATE course_discussions SET content = ?
                WHERE id = ? AND course_id = ? AND is_deleted = FALSE
                """, input.content().trim(), id, courseId);
        if (updated == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        return find(courseId, id);
    }

    @Transactional
    public void delete(Long courseId, Long id) {
        access.requireParticipant(courseId);
        requireOwnerOrStaff(courseId, id);
        jdbc.update("""
                UPDATE course_discussions SET content = '[deleted]', is_deleted = TRUE
                WHERE id = ? AND course_id = ? AND is_deleted = FALSE
                """, id, courseId);
    }

    private Long requireAuthor(Long courseId, Long id) {
        Long authorId = jdbc.query("SELECT author_id FROM course_discussions WHERE id = ? AND course_id = ?",
                rs -> rs.next() ? rs.getLong(1) : null, id, courseId);
        if (authorId == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        return authorId;
    }

    private void requireOwner(Long courseId, Long id) {
        if (!requireAuthor(courseId, id).equals(access.userId())) CourseAccess.forbidden();
    }

    private void requireOwnerOrStaff(Long courseId, Long id) {
        Long authorId = requireAuthor(courseId, id);
        if (authorId.equals(access.userId()) || access.hasRole("ADMIN")) return;
        if (access.hasRole("LECTURER")) { access.requireStaff(courseId); return; }
        CourseAccess.forbidden();
    }

    private CommentView find(Long courseId, Long id) {
        return list(courseId).stream().filter(c -> c.id().equals(id)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    }
}
