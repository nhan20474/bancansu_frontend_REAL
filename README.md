# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
------------------------------------------------------------------------------------------------------------------------
Node js:
https://nodejs.org/en/download
Sử dụng cmd để kiểm tra kết quả:
 ●Kiểm tra phiên bản node: node –version
 ●Kiểm tra phiên bản: npm --version

Cài đặt TypeScript compiler:
 ● Sử dụng npm cài đặt TypeScript compiler:
 ○ Cài đặt bản mới nhất: npm install --global typescript
 ○ Cài đặt bản chỉ định: npm install --global 
typescript@9.8.1
 ● Kiểm tra phiên bản:
 ○ tsc –-version
Cài Maven:
 ● Vs code: Tải plugin Maven về (Hiện cái j recommend thì tải) (Thắc mắc hỏi t ngay)
 ● IntelliJ IDEA: click chuột vào mấy cái file nào thấy chữ maven rồi kiếm cái download maven (Download Sources vs Document)
Cài dặt React:
// Tạo dự án mới
 npx create-react-app my
app
 // Khởi động dự án
 cd my-app
 npm start
 // Thay đổi port
 set PORT= số j m muốn & npm 
start
// Tạo dự án react typescript trong file mình
npx create-react-app bcsproject_frontend typescript
npm install react-router-dom
(npx create-react-app my app typescript)
 // Khởi động dự án
 cd my-app
 npm start
 // Thay đổi port (Để cho nó lành)
 set PORT= số m muốn & npm start
 
------------------------------------------------------------------------------------------------------------------------

//CSDL nếu bọn m thích, ko thì build cái khác giùm
-- =============================
-- 1. Roles
-- =============================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- =============================
-- 2. Users
-- =============================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mssv VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    dob DATE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- =============================
-- 3. Classes
-- =============================
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    semester VARCHAR(20),
    homeroom_teacher_id INT,
    FOREIGN KEY (homeroom_teacher_id) REFERENCES users(id)
);

-- =============================
-- 4. Students
-- =============================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    class_id INT NOT NULL,
    is_class_representative BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- =============================
-- 5. Assignments
-- =============================
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    deadline DATETIME,
    class_id INT NOT NULL,
    author_id INT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =============================
-- 6. Assignment Answers
-- =============================
CREATE TABLE assignment_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    file_url TEXT,
    submitted_at DATETIME,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- =============================
-- 7. Groups
-- =============================
CREATE TABLE groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    project_id INT
);

-- =============================
-- 8. Group Members
-- =============================
CREATE TABLE group_members (
    group_id INT,
    student_id INT,
    PRIMARY KEY (group_id, student_id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- =============================
-- 9. Projects
-- =============================
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    group_id INT,
    FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- =============================
-- 10. Tasks
-- =============================
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    assigned_to INT,
    project_id INT,
    status ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending',
    due_date DATETIME,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- =============================
-- 11. Posts
-- =============================
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    content TEXT,
    document_link TEXT,
    post_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =============================
-- 12. Notifications
-- =============================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    sent_to_role INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sent_to_role) REFERENCES roles(id)
);
CREATE TABLE evaluation_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluator_id INT NOT NULL,         -- Người đánh giá (SV hoặc Giảng viên)
    evaluatee_id INT NOT NULL,         -- Người bị đánh giá (thành viên BCS)
    role_in_class VARCHAR(50),         -- Vai trò: Lớp trưởng, Lớp phó, v.v.
    support_score INT,                 -- Điểm hỗ trợ học tập
    responsibility_score INT,          -- Điểm trách nhiệm
    transparency_score INT,            -- Điểm minh bạch
    leadership_score INT,              -- Điểm điều hành (nếu giảng viên đánh giá)
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluator_id) REFERENCES users(id),
    FOREIGN KEY (evaluatee_id) REFERENCES users(id)
);
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    report_type ENUM('weekly', 'monthly', 'event') DEFAULT 'weekly',
    class_id INT NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE TABLE report_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    responder_id INT NOT NULL,
    content TEXT,
    response_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id),
    FOREIGN KEY (responder_id) REFERENCES users(id)
);
