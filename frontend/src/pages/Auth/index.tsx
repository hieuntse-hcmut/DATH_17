import { Link } from 'react-router'

export default function Auth({ isLogin }: { isLogin: boolean }) {

  return (
    <div>
      <h1 className="text-2xl font-bold pb-16">{isLogin ? 'Login' : 'Register'} Page</h1>
      <Link className="p-10 border" to="/">Go to Home</Link>
      <Link className="p-10 border" to={isLogin ? '/sign-up' : '/log-in'}>
        {isLogin ? 'Go to Register' : 'Go to Login'}
      </Link>
    </div>
  )
}