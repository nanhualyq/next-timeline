import { Divider, Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import SideMenu from "./_components/SideMenu";
import ChannelTree from "./_components/ChannelTree";
import styles from "./layout.module.css";

interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default async function TimelineLayout({ children, modal }: Props) {
  return (
    <>
      <Layout className={styles.root}>
        <Sider
          theme="light"
          className={styles.sider}
        >
          <SideMenu />
          <Divider size="small" />
          <ChannelTree />
        </Sider>
        <Content>{children}</Content>
      </Layout>
      {modal}
    </>
  );
}
