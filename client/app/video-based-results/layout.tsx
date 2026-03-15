import { IS_CUBING_CONTESTS_INSTANCE } from "~/helpers/constants";

type Props = {
  children: React.ReactNode;
};

function VideoBasedResultsLayout({ children }: Props) {
  if (!IS_CUBING_CONTESTS_INSTANCE)
    return <span className="text-center">THIS PAGE IS ONLY SUPPORTED FOR CUBINGCONTESTS.COM</span>;

  return children;
}

export default VideoBasedResultsLayout;
