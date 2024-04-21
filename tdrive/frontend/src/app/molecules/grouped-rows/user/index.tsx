/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import BaseBlock from '@molecules/grouped-rows/base';

// @ts-ignore
interface UserBlockProps extends React.InputHTMLAttributes<HTMLInputElement> {
  avatar: JSX.Element;
  title: JSX.Element | string;
  subtitle: JSX.Element | string;
  suffix?: JSX.Element | string;
  className?: string;
}

export default function UserBlock(props: UserBlockProps) {
  return BaseBlock(props);
}
