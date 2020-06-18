import { mount } from "enzyme";
import * as React from "react";
import { IClusterState } from "reducers/cluster";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import ErrorBoundaryContainer from ".";
import UnexpectedErrorPage from "../../components/ErrorAlert/UnexpectedErrorAlert";

const mockStore = configureMockStore([thunk]);
const makeStore = (error?: { action: string; error: Error }) => {
  const state: IClusterState = {
    currentNamespace: "default",
    namespaces: ["default"],
    error,
  };
  return mockStore({ namespace: state });
};

describe("LoginFormContainer props", () => {
  it("maps namespace redux state to props", () => {
    const store = makeStore({ action: "get", error: new Error("boom!") });
    const wrapper = mount(<ErrorBoundaryContainer store={store} children={<></>} />);
    expect(wrapper.find(UnexpectedErrorPage).text()).toContain("boom!");
  });
});
