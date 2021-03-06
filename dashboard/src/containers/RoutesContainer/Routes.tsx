import * as React from "react";
import { Redirect, Route, RouteComponentProps, RouteProps, Switch } from "react-router";
import NotFound from "../../components/NotFound";
import AppListContainer from "../../containers/AppListContainer";
import AppNewContainer from "../../containers/AppNewContainer";
import AppUpgradeContainer from "../../containers/AppUpgradeContainer";
import AppViewContainer from "../../containers/AppViewContainer";
import CatalogContainer from "../../containers/CatalogContainer";
import ChartViewContainer from "../../containers/ChartViewContainer";
import LoginFormContainer from "../../containers/LoginFormContainer";
import OperatorInstanceCreateContainer from "../../containers/OperatorInstanceCreateContainer";
import OperatorInstanceUpdateContainer from "../../containers/OperatorInstanceUpdateContainer";
import OperatorInstanceViewContainer from "../../containers/OperatorInstanceViewContainer";
import OperatorNewContainer from "../../containers/OperatorNewContainer";
import OperatorsListContainer from "../../containers/OperatorsListContainer";
import OperatorViewContainer from "../../containers/OperatorViewContainer";
import PrivateRouteContainer from "../../containers/PrivateRouteContainer";
import RepoListContainer from "../../containers/RepoListContainer";
import ServiceBrokerListContainer from "../../containers/ServiceBrokerListContainer";
import ServiceClassListContainer from "../../containers/ServiceClassListContainer";
import ServiceClassViewContainer from "../../containers/ServiceClassViewContainer";
import ServiceInstanceListContainer from "../../containers/ServiceInstanceListContainer";
import ServiceInstanceViewContainer from "../../containers/ServiceInstanceViewContainer";
import { app } from "../../shared/url";


type IRouteComponentPropsAndRouteProps = RouteProps & RouteComponentProps<any>;

const privateRoutes = {
  "/c/:cluster/ns/:namespace/apps": AppListContainer,
  "/ns/:namespace/apps/:releaseName": AppViewContainer,
  "/ns/:namespace/apps/:releaseName/upgrade": AppUpgradeContainer,
  "/ns/:namespace/apps/new/:repo/:id/versions/:version": AppNewContainer,
  "/ns/:namespace/apps/new-from-:global(global)/:repo/:id/versions/:version": AppNewContainer,
  "/ns/:namespace/catalog": CatalogContainer,
  "/ns/:namespace/catalog/:repo": CatalogContainer,
  "/ns/:namespace/charts/:repo/:id": ChartViewContainer,
  "/ns/:namespace/:global(global)-charts/:repo/:id": ChartViewContainer,
  "/ns/:namespace/charts/:repo/:id/versions/:version": ChartViewContainer,
  "/ns/:namespace/:global(global)-charts/:repo/:id/versions/:version": ChartViewContainer,
  "/config/brokers": ServiceBrokerListContainer,
  "/services/brokers/:brokerName/classes/:className": ServiceClassViewContainer,
  "/services/brokers/:brokerName/instances/ns/:namespace/:instanceName": ServiceInstanceViewContainer,
  "/services/classes": ServiceClassListContainer,
  "/ns/:namespace/services/instances": ServiceInstanceListContainer,
} as const;

// Public routes that don't require authentication
const routes = {
  "/login": LoginFormContainer,
} as const;

interface IRoutesProps extends IRouteComponentPropsAndRouteProps {
  namespace: string;
  cluster: string;
  authenticated: boolean;
  featureFlags: {
    operators: boolean;
  };
}

class Routes extends React.Component<IRoutesProps> {
  public static defaultProps = {
    featureFlags: { operators: false },
  };
  public render() {
    const reposPath = "/config/ns/:namespace/repos";
    if (this.props.featureFlags.operators) {
      // Add routes related to operators
      Object.assign(privateRoutes, {
        "/ns/:namespace/operators": OperatorsListContainer,
        "/ns/:namespace/operators/:operator": OperatorViewContainer,
        "/ns/:namespace/operators/new/:operator": OperatorNewContainer,
        "/ns/:namespace/operators-instances/new/:csv/:crd": OperatorInstanceCreateContainer,
        "/ns/:namespace/operators-instances/:csv/:crd/:instanceName": OperatorInstanceViewContainer,
        "/ns/:namespace/operators-instances/:csv/:crd/:instanceName/update": OperatorInstanceUpdateContainer,
      });
    }
    return (
      <Switch>
        <Route exact={true} path="/" render={this.rootNamespacedRedirect} />
        {Object.entries(routes).map(([route, component]) => (
          <Route key={route} exact={true} path={route} component={component} />
        ))}
        {Object.entries(privateRoutes).map(([route, component]) => (
          <PrivateRouteContainer key={route} exact={true} path={route} component={component} />
        ))}
        <PrivateRouteContainer
          key={reposPath}
          exact={true}
          path={reposPath}
          component={RepoListContainer}
        />
        {/* If the route doesn't match any expected path redirect to a 404 page  */}
        <Route component={NotFound} />
      </Switch>
    );
  }
  private rootNamespacedRedirect = () => {
    if (this.props.namespace && this.props.authenticated) {
      return <Redirect to={app.apps.list(this.props.namespace, this.props.cluster)} />;
    }
    // There is not a default namespace, redirect to login page
    return <Redirect to={"/login"} />;
  };
}

export default Routes;
