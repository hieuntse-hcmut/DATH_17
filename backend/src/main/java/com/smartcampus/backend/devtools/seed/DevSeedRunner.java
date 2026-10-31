
package com.smartcampus.backend.devtools.seed;

import java.sql.*;
import java.util.*;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevSeedRunner implements ApplicationRunner {

    private final DataSource dataSource;
    private final PasswordEncoder passwordEncoder;
    private final boolean reset;
    private final String confirmation;

    public DevSeedRunner(
            DataSource dataSource,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.reset:false}") boolean reset,
            @Value("${app.seed.confirm:}") String confirmation) {

        this.dataSource = dataSource;
        this.passwordEncoder = passwordEncoder;
        this.reset = reset;
        this.confirmation = confirmation;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {

        if (!reset) {
            return;
        }

        if (!"RESET_DEV_DATA".equals(confirmation)) {
            throw new IllegalStateException(
                    "Seeder requires --app.seed.confirm=RESET_DEV_DATA"
            );
        }

        try (Connection c = dataSource.getConnection()) {

            String db = c.getCatalog();

            if (db == null || !db.matches("[A-Za-z0-9_]+_seed")) {
                throw new IllegalStateException(
                        "Refusing destructive seed on database: " + db
                                + " (database name must end with _seed)"
                );
            }

            boolean originalAutoCommit = c.getAutoCommit();
            c.setAutoCommit(false);

            try {
                execute(c, "SET FOREIGN_KEY_CHECKS=0");

                List<String> tables = new ArrayList<>();

                try (PreparedStatement ps = c.prepareStatement(
                        "SELECT table_name FROM information_schema.tables "
                                + "WHERE table_schema=? "
                                + "AND table_type='BASE TABLE' "
                                + "AND table_name <> 'flyway_schema_history'"
                )) {
                    ps.setString(1, db);

                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            tables.add(rs.getString(1));
                        }
                    }
                }

                for (String table : tables) {

                    if (!table.matches("[A-Za-z0-9_]+")) {
                        throw new IllegalStateException(
                                "Unsafe table: " + table
                        );
                    }

                    execute(c, "DELETE FROM `" + table + "`");
                }

                execute(c, "SET FOREIGN_KEY_CHECKS=1");

                long admin = insert(
                        c,
                        "INSERT INTO users "
                                + "(username,password_hash,full_name,email,role,status) "
                                + "VALUES(?,?,?,?,?,?)",
                        "seed_admin",
                        passwordEncoder.encode("Test@123456"),
                        "Seed Administrator",
                        "admin@test.local",
                        "ADMIN",
                        "ACTIVE"
                );

                long lecturer = insert(
                        c,
                        "INSERT INTO users "
                                + "(username,password_hash,full_name,email,role,status) "
                                + "VALUES(?,?,?,?,?,?)",
                        "seed_lecturer",
                        passwordEncoder.encode("Test@123456"),
                        "Seed Lecturer",
                        "lecturer@test.local",
                        "LECTURER",
                        "ACTIVE"
                );

                long student = insert(
                        c,
                        "INSERT INTO users "
                                + "(username,password_hash,full_name,email,role,status) "
                                + "VALUES(?,?,?,?,?,?)",
                        "seed_student",
                        passwordEncoder.encode("Test@123456"),
                        "Seed Student",
                        "student@test.local",
                        "STUDENT",
                        "ACTIVE"
                );

                boolean lessonContentType =
                        column(c, "lessons", "content_type");

                boolean lessonLength =
                        column(c, "lessons", "total_length");

                boolean materialLength =
                        column(c, "learning_materials", "total_length");

                for (int courseNo = 1; courseNo <= 5; courseNo++) {

                    long course = insert(
                            c,
                            "INSERT INTO courses "
                                    + "(title,description,publication_state,"
                                    + "is_enrollment_open,created_by) "
                                    + "VALUES(?,?,?,?,?)",
                            "Seed Course " + courseNo,
                            "Development-only sample course " + courseNo,
                            "PUBLISHED",
                            true,
                            lecturer
                    );

                    execute(
                            c,
                            "INSERT INTO course_lecturers "
                                    + "(course_id,lecturer_id) VALUES(?,?)",
                            course,
                            lecturer
                    );

                    if (courseNo <= 4) {
                        execute(
                                c,
                                "INSERT INTO enrollments "
                                        + "(student_id,course_id,status) VALUES(?,?,?)",
                                student,
                                course,
                                "ACTIVE"
                        );
                    }

                    for (int ch = 1; ch <= 2; ch++) {

                        long chapter = insert(
                                c,
                                "INSERT INTO chapters "
                                        + "(course_id,title,order_index) VALUES(?,?,?)",
                                course,
                                "Chapter " + ch,
                                ch
                        );

                        for (int li = 1; li <= 3; li++) {

                            boolean video = li % 2 == 1;

                            StringBuilder sql = new StringBuilder(
                                    "INSERT INTO lessons "
                                            + "(chapter_id,title,order_index"
                            );

                            List<Object> values = new ArrayList<>(
                                    Arrays.asList(
                                            chapter,
                                            "Lesson " + ch + "." + li,
                                            li
                                    )
                            );

                            if (lessonContentType) {
                                sql.append(",content_type");
                                values.add(video ? "VIDEO" : "PDF");
                            }

                            if (lessonLength) {
                                sql.append(",total_length");
                                values.add(video ? 600 : 10);
                            }

                            sql.append(
                                    ") VALUES("
                                            + "?,".repeat(values.size() - 1)
                                            + "?)"
                            );

                            long lesson = insert(
                                    c,
                                    sql.toString(),
                                    values.toArray()
                            );

                            for (int mi = 1; mi <= 2; mi++) {

                                String type = video ? "VIDEO" : "PDF";

                                String url = video
                                        ? "https://example.com/dev/sample-video.mp4"
                                        : "https://example.com/dev/sample.pdf";

                                String materialSql =
                                        "INSERT INTO learning_materials "
                                                + "(lesson_id,title,file_url,file_type"
                                                + (materialLength ? ",total_length" : "")
                                                + ") VALUES(?,?,?,?"
                                                + (materialLength ? ",?" : "")
                                                + ")";

                                if (materialLength) {
                                    insert(
                                            c,
                                            materialSql,
                                            lesson,
                                            "Material " + mi,
                                            url,
                                            type,
                                            video ? 600 : 10
                                    );
                                } else {
                                    insert(
                                            c,
                                            materialSql,
                                            lesson,
                                            "Material " + mi,
                                            url,
                                            type
                                    );
                                }
                            }
                        }
                    }

                    execute(
                            c,
                            "INSERT INTO assessments "
                                    + "(course_id,title,status,duration_minutes,"
                                    + "max_attempts) VALUES(?,?,?,?,?)",
                            course,
                            "Seed Quiz " + courseNo,
                            "PUBLISHED",
                            30,
                            3
                    );
                }

                c.commit();

                System.out.println(
                        "[DEV SEED] Created 3 users, 5 courses, "
                                + "10 chapters, 30 lessons, 60 materials, "
                                + "4 enrollments and 5 assessments in " + db
                );

            } catch (Exception ex) {
                c.rollback();
                throw ex;

            } finally {
                try {
                    execute(c, "SET FOREIGN_KEY_CHECKS=1");
                } finally {
                    c.setAutoCommit(originalAutoCommit);
                }
            }
        }
    }

    private static boolean column(
            Connection c,
            String table,
            String name) throws SQLException {

        try (ResultSet r = c.getMetaData().getColumns(
                c.getCatalog(), null, table, name)) {
            return r.next();
        }
    }

    private static void execute(
            Connection c,
            String sql,
            Object... values) throws SQLException {

        try (PreparedStatement ps = c.prepareStatement(sql)) {

            for (int i = 0; i < values.length; i++) {
                ps.setObject(i + 1, values[i]);
            }

            ps.executeUpdate();
        }
    }

    private static long insert(
            Connection c,
            String sql,
            Object... values) throws SQLException {

        try (PreparedStatement ps = c.prepareStatement(
                sql,
                Statement.RETURN_GENERATED_KEYS)) {

            for (int i = 0; i < values.length; i++) {
                ps.setObject(i + 1, values[i]);
            }

            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {

                if (!keys.next()) {
                    throw new SQLException(
                            "No generated key for " + sql
                    );
                }

                return keys.getLong(1);
            }
        }
    }
}
