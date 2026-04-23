import Link from "next/link";
import type { NavigationItem } from "~/helpers/types/NavigationItem.ts";

type Props = {
  tabs: NavigationItem[];
  activeTab: string; // the value of the currently active tab
} & (
  | {
      setActiveTab: (val: string) => void;
      forServerSidePage?: never;
      replace?: never;
    }
  | {
      setActiveTab?: never;
      forServerSidePage: true;
      replace?: boolean;
    }
);

function Tabs({ tabs, activeTab, setActiveTab, replace = false, forServerSidePage }: Props) {
  return (
    <ul className="nav nav-tabs mb-3">
      {tabs
        .filter((el) => !el.hidden)
        .map((tab) => (
          <li key={tab.value} className="nav-item me-2">
            {!forServerSidePage && setActiveTab ? (
              <button
                type="button"
                onClick={() => setActiveTab(tab.value)}
                disabled={tab.disabled}
                className={`nav-link ${activeTab === tab.value ? "active" : ""}`}
              >
                <span className="d-none d-md-inline">{tab.title}</span>
                <span className="d-inline d-md-none">{tab.shortTitle || tab.title}</span>
              </button>
            ) : (
              <Link
                href={tab.route!}
                prefetch={false}
                replace={replace}
                className={`nav-link ${activeTab === tab.value ? "active" : ""}`}
              >
                <span className="d-none d-md-inline">{tab.title}</span>
                <span className="d-inline d-md-none">{tab.shortTitle || tab.title}</span>
              </Link>
            )}
          </li>
        ))}
    </ul>
  );
}

export default Tabs;
