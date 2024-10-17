export interface Props {
  children: string;
}

export const Tag = ({ children }: Props) => (
  <span className="tag">{children}</span>
);
