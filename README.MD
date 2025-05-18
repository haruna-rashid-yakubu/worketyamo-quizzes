+----------------+       +---------------+       +----------------+
|    subjects    |       |    quizzes    |       |     users      |
+----------------+       +---------------+       +----------------+
| id             |<----->| id            |<----->| id             |
| name           |       | title         |       | email          |
| description    |       | description   |       | full_name      |
| created_at     |       | subject_id    |       | avatar_url     |
|                |       | creator_id    |       | created_at     |
|                |       | time_limit    |       | updated_at     |
|                |       | due_date      |       |                |
|                |       | is_public     |       |                |
|                |       | created_at    |       |                |
|                |       | updated_at    |       |                |
+----------------+       +---------------+       +----------------+
                                |
                                |
                         +------v-------+
                         |  questions   |
                         +--------------+
                         | id           |
                         | quiz_id      |
                         | text         |
                         | type         |
                         | points       |
                         | order_num    |
                         | created_at   |
                         +--------------+
                                |
                 +---------------+---------------+
                 |                               |
         +-------v--------+               +------v-------+
         |    options     |               |   answers    |
         +----------------+               +--------------+
         | id             |               | id           |
         | question_id    |               | question_id  |
         | text           |               | correct_answer |
         | option_id      |               | created_at   |
         | created_at     |               |              |
         +----------------+               +--------------+
                                                |
                                                |
                 +--------------------------------+
                 |                                |
         +-------v--------+               +-------v-------+
         | quiz_attempts  |               | user_answers  |
         +----------------+               +---------------+
         | id             |<------------->| id            |
         | quiz_id        |               | attempt_id    |
         | user_id        |               | question_id   |
         | start_time     |               | user_answer   |
         | end_time       |               | is_correct    |
         | score          |               | points_earned |
         | max_score      |               | created_at    |
         | is_complete    |               |               |
         +----------------+               +---------------+