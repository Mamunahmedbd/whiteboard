import * as Icons from 'react-icons/tb';
import ExtraLarge from './ExtraLarge/ExtraLarge';
import FilledSolid from './FilledSolid/FilledSolid';
import { getIconSize, getIconStrokeWidth } from './getIconProps';
import type { SIZE, STROKE } from './getIconProps';
import type { IconBaseProps } from 'react-icons';

export type IconName = keyof typeof ICONS;
export type IconSize = keyof typeof SIZE;
export type IconStroke = keyof typeof STROKE;

export type IconProps = {
  name: IconName;
  stroke?: IconStroke | number;
  size?: IconSize;
} & Omit<IconBaseProps, 'stroke' | 'size'>;

const ICONS = {
  arrowBackUp: Icons.TbArrowBackUp,
  arrowForwardUp: Icons.TbArrowForwardUp,
  arrowUpRight: Icons.TbArrowUpRight,
  trash: Icons.TbTrash,
  fileDownload: Icons.TbFileDownload,
  fileUpload: Icons.TbFileUpload,
  photoDown: Icons.TbPhotoDown,
  circleFilled: Icons.TbCircleFilled,
  circle: Icons.TbCircle,
  filledNone: Icons.TbLayersIntersect,
  filledSemi: Icons.TbLayersSubtract,
  filledSolid: FilledSolid,
  lineDashed: Icons.TbLineDashed,
  lineDotted: Icons.TbLineDotted,
  plus: Icons.TbPlus,
  minus: Icons.TbMinus,
  handStop: Icons.TbHandStop,
  pointer: Icons.TbPointer,
  scribble: Icons.TbScribble,
  square: Icons.TbSquare,
  text: Icons.TbTypography,
  x: Icons.TbX,
  spinner: Icons.TbLoader2,
  dots: Icons.TbDots,
  link: Icons.TbLink,
  copy: Icons.TbCopy,
  clipboardCheck: Icons.TbClipboardCheck,
  users: Icons.TbUsers,
  check: Icons.TbCheck,
  pencil: Icons.TbPencil,
  moon: Icons.TbMoon,
  moonStars: Icons.TbMoonStars,
  laser: Icons.TbNorthStar,
  book: Icons.TbBook,
  letterS: Icons.TbLetterS,
  letterM: Icons.TbLetterM,
  letterL: Icons.TbLetterL,
  extraLarge: ExtraLarge,
  arrowNarrowRight: Icons.TbArrowNarrowRight,
  arrowNarrowLeft: Icons.TbArrowNarrowLeft,
} as const;

const Icon = (props: IconProps) => {
  const { name, stroke, size, ...rest } = props;

  const sizeValue = getIconSize(size);
  const strokeValue = getIconStrokeWidth(stroke);

  const Component = ICONS[name];

  return (
    <Component
      size={sizeValue}
      strokeWidth={strokeValue}
      data-testid={`${name}-icon`}
      {...rest}
    />
  );
};

export default Icon;

export function IconBxSave(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M5 21h14a2 2 0 002-2V8a1 1 0 00-.29-.71l-4-4A1 1 0 0016 3H5a2 2 0 00-2 2v14a2 2 0 002 2zm10-2H9v-5h6zM13 7h-2V5h2zM5 5h2v4h8V5h.59L19 8.41V19h-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5H5z" />
    </svg>
  );
}

export function IconCreate(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 21 21"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <g
        fill="none"
        fillRule="evenodd"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 4.5H5.5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V11" />
        <path d="M17.5 3.467a1.462 1.462 0 01-.017 2.05L10.5 12.5l-3 1 1-3 6.987-7.046a1.409 1.409 0 011.885-.104zM15.5 5.5l.953 1" />
      </g>
    </svg>
  );
}

export function IconDiagramProject(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 576 512"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M0 80c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v16h192V80c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48h-96c-26.5 0-48-21.5-48-48v-16H192v16c0 1.7-.1 3.4-.3 5L272 288h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48h-96c-26.5 0-48-21.5-48-48v-96c0-1.7.1-3.4.3-5L144 224H48c-26.5 0-48-21.5-48-48V80z" />
    </svg>
  );
}

export function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        opacity={0.25}
      ></path>
      <path
        fill="currentColor"
        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
      >
        <animateTransform
          attributeName="transform"
          dur="0.75s"
          repeatCount="indefinite"
          type="rotate"
          values="0 12 12;360 12 12"
        ></animateTransform>
      </path>
    </svg>
  );
}
