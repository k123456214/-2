/// <reference types="@tarojs/taro" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace JSX {
  interface IntrinsicElements {
    view: any
    text: any
    image: any
    button: any
    input: any
    input: any
    textarea: any
    scroll-view: any
    swiper: any
    swiper-item: any
    swiper-slide: any
  }
}

declare const API_BASE: string;
declare const APP_VERSION: string;

declare interface AnyObject {
  [key: string]: any
}
