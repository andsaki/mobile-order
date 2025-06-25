import React from "react";

interface LayoutConverterProps {
  title: string;
  children: React.ReactNode;
}

const LayoutConverter: React.FC<LayoutConverterProps> = ({
  title,
  children,
}) => {
  return (
    <div className="layout-converter">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <div className="content">{children}</div>
    </div>
  );
};

export default LayoutConverter;
