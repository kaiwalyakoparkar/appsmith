import type { RefObject } from "react";
import React, { useRef, useCallback } from "react";
import styled from "styled-components";
import { Icon, IconSize } from "design-system-old";
import DebuggerLogs from "./DebuggerLogs";
import { useDispatch, useSelector } from "react-redux";
import {
  setDebuggerSelectedTab,
  setResponsePaneHeight,
  showDebugger,
} from "actions/debuggerActions";
import {
  getDebuggerSelectedTab,
  getErrorCount,
  getResponsePaneHeight,
} from "selectors/debuggerSelectors";
import AnalyticsUtil from "utils/AnalyticsUtil";
import Errors from "./Errors";
import Resizer, { ResizerCSS } from "./Resizer";
import EntityDeps from "./EntityDependecies";
import {
  createMessage,
  DEBUGGER_ERRORS,
  DEBUGGER_LOGS,
  INSPECT_ENTITY,
} from "@appsmith/constants/messages";
import { stopEventPropagation } from "utils/AppsmithUtils";
import { DEBUGGER_TAB_KEYS } from "./helpers";
import { Colors } from "constants/Colors";
import EntityBottomTabs from "../EntityBottomTabs";
import { ActionExecutionResizerHeight } from "pages/Editor/APIEditor/constants";

const TABS_HEADER_HEIGHT = 36;

const Container = styled.div`
  ${ResizerCSS}
  position: absolute;
  bottom: 0;
  height: ${ActionExecutionResizerHeight}px;
  min-height: ${TABS_HEADER_HEIGHT}px;
  background-color: ${(props) => props.theme.colors.debugger.background};
  border-top: 1px solid ${Colors.ALTO};

  ul.react-tabs__tab-list {
    padding: 0px ${(props) => props.theme.spaces[12]}px;
  }
  .react-tabs__tab-panel {
    height: calc(100% - ${TABS_HEADER_HEIGHT}px);
  }

  .close-debugger {
    position: absolute;
    top: 0px;
    right: 0px;
    padding: 9px 11px;
  }
`;

function DebuggerTabs() {
  const dispatch = useDispatch();
  const panelRef: RefObject<HTMLDivElement> = useRef(null);
  const selectedTab = useSelector(getDebuggerSelectedTab);
  // fetch the error count from the store.
  const errorCount = useSelector(getErrorCount);
  // get the height of the response pane.
  const responsePaneHeight = useSelector(getResponsePaneHeight);
  // set the height of the response pane.
  const updateResponsePaneHeight = useCallback((height: number) => {
    dispatch(setResponsePaneHeight(height));
  }, []);
  const setSelectedTab = (tabKey: string) => {
    if (tabKey === DEBUGGER_TAB_KEYS.ERROR_TAB) {
      AnalyticsUtil.logEvent("OPEN_DEBUGGER", {
        source: "WIDGET_EDITOR",
      });
    }
    dispatch(setDebuggerSelectedTab(tabKey));
  };
  const onClose = () => dispatch(showDebugger(false));

  const DEBUGGER_TABS = [
    {
      key: DEBUGGER_TAB_KEYS.ERROR_TAB,
      title: createMessage(DEBUGGER_ERRORS),
      count: errorCount,
      panelComponent: <Errors hasShortCut />,
    },
    {
      key: DEBUGGER_TAB_KEYS.LOGS_TAB,
      title: createMessage(DEBUGGER_LOGS),
      panelComponent: <DebuggerLogs hasShortCut />,
    },
    {
      key: DEBUGGER_TAB_KEYS.INSPECT_TAB,
      title: createMessage(INSPECT_ENTITY),
      panelComponent: <EntityDeps />,
    },
  ];

  // Do not render if response tab and header tab is selected in the bottom bar.
  const shouldRender = !(
    selectedTab === DEBUGGER_TAB_KEYS.RESPONSE_TAB ||
    selectedTab === DEBUGGER_TAB_KEYS.HEADER_TAB
  );

  return shouldRender ? (
    <Container
      className="t--debugger-tabs-container"
      onClick={stopEventPropagation}
      ref={panelRef}
    >
      <Resizer
        initialHeight={responsePaneHeight}
        onResizeComplete={(height: number) => {
          updateResponsePaneHeight(height);
        }}
        panelRef={panelRef}
        snapToHeight={ActionExecutionResizerHeight}
      />
      <EntityBottomTabs
        expandedHeight={`${ActionExecutionResizerHeight}px`}
        onSelect={setSelectedTab}
        selectedTabKey={selectedTab}
        tabs={DEBUGGER_TABS}
      />
      <Icon
        className="close-debugger t--close-debugger"
        name="close-modal"
        onClick={onClose}
        size={IconSize.XL}
      />
    </Container>
  ) : null;
}

export default DebuggerTabs;
