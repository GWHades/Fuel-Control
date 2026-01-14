import axios from 'axios';

export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  form.append('grant_type', 'password');

  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/login`,
    form.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}
