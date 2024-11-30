import React, { useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppContext } from '../AppContext';

function Login() {
  const { setUser } = useContext(AppContext);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Required'),
    }),
    onSubmit: (values) => {
      if (values.email === 'client1@example.com' && values.password === 'password') {
        setUser({ email: values.email });
        alert('Login successful!');
      } else {
        alert('Invalid email or password');
      }
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Login</h1>
      <form onSubmit={formik.handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            {...formik.getFieldProps('email')}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {formik.touched.email && formik.errors.email ? (
            <p className="text-red-500">{formik.errors.email}</p>
          ) : null}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            {...formik.getFieldProps('password')}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="text-red-500">{formik.errors.password}</p>
          ) : null}
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;