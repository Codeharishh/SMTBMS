const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      department: user.department || 'General',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

exports.register = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { name, email, password, role, phone, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedDepartment = department ? department.toString().trim() : 'General';
    const userDepartment = normalizedDepartment === '' ? 'General' : normalizedDepartment;

    const [exists] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role ? role.toString().trim() : 'Employee';
    const userRole = normalizedRole === '' ? 'Employee' : normalizedRole;

    await connection.beginTransaction();
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, role, phone, department, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [name, email, hashedPassword, userRole, phone || '', userDepartment]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      role: userRole,
      department: userDepartment,
      phone: phone || '',
    };

    let employeeRecord = null;
    if (userRole.toLowerCase() === 'employee') {
      const [existingEmployee] = await connection.query('SELECT id FROM employees WHERE user_id = ?', [user.id]);
      if (!existingEmployee.length) {
        const [employeeResult] = await connection.query(
          'INSERT INTO employees (user_id, department, designation, salary, join_date, attendance_status, leave_balance) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
          [user.id, userDepartment, '', 0, 'Present', 0]
        );
        employeeRecord = {
          id: employeeResult.insertId,
          user_id: user.id,
          department: userDepartment,
          designation: '',
          salary: 0,
          attendance_status: 'Present',
          leave_balance: 0,
        };
      }
    }

    await connection.commit();
    const token = signToken(user);
    const responseData = { user, token };
    if (employeeRecord) responseData.employee = employeeRecord;

    res.status(201).json(responseData);
  } catch (error) {
    await connection.rollback();
    console.error('Register error', error);
    res.status(500).json({ message: 'Unable to register user' });
  } finally {
    connection.release();
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'General',
        phone: user.phone || '',
      },
      token,
    });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    console.error('Profile error', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};
