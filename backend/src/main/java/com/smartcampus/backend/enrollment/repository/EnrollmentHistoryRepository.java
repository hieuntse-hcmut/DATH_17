package com.smartcampus.backend.enrollment.repository;

import com.smartcampus.backend.enrollment.entity.EnrollmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentHistoryRepository extends JpaRepository<EnrollmentHistory, Long> {
    List<EnrollmentHistory> findByEnrollmentIdOrderByCreatedAtAsc(Long enrollmentId);
}