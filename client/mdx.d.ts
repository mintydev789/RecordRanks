// Source - https://stackoverflow.com/a/67365297
// Posted by enoch, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-20, License - CC BY-SA 4.0

// For some reason, installing @types/mdx wasn't enough anymore
declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}
