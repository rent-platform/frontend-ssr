import styles from "./AuthLayout.module.scss";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className={styles.layout}>
    <div className={styles.authLayout}>{children}</div>
  </div>
);

export default AuthLayout;

