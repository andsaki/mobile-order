import { Meta, StoryObj } from "@storybook/react";

import { LoadingProvider, useLoading } from "../contexts/LoadingContext";

import Loading from "./Loading";

const meta: Meta<typeof Loading> = {
  title: "Components/Loading",
  component: Loading,
  decorators: [
    (Story) => (
      <LoadingProvider>
        <Story />
      </LoadingProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Loading>;

export const Default: Story = {
  parameters: {
    loading: true,
  },
  render: () => <Loading />,
  // デフォルトのストーリーでは、ローディング状態が表示されます。スピナーと「処理中...」テキストが表示され、ユーザーに処理が進行中であることを伝えます。
  name: "デフォルト (表示中)",
};

export const Hidden: Story = {
  parameters: {
    loading: false,
  },
  render: () => <Loading />,
  // 非表示のストーリーでは、ローディング状態が非表示になります。`isLoading` が `false` の場合、コンポーネントは何も表示しません。
  name: "非表示",
};

// ストーリーパラメータに基づいてローディング状態を設定するデコレータをオーバーライド
meta.decorators = [
  (Story, context) => {
    const loading = (context.parameters.loading as boolean) || false;
    return (
      <LoadingProvider>
        <StoryContextWrapper loading={loading} story={<Story />} />
      </LoadingProvider>
    );
  },
];

// ローディング状態を設定するためのラッパーコンポーネント
const StoryContextWrapper = ({
  loading,
  story,
}: {
  loading: boolean;
  story: React.ReactNode;
}) => {
  const { setLoading } = useLoading();
  setLoading(loading);
  return <>{story}</>;
};

// ストーリーブックがコンテキストにアクセスするために必要なインポート
