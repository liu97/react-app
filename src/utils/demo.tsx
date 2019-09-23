import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IState {
    [key: string]: any,
}
interface IProps {
    [key: string]: any,
}

type TDemoProps = IProps & RouteComponentProps

class Demo extends Component<TDemoProps, IState> {
    readonly state: Readonly<IState> = {
        username: '',
        password: '',
    }
    timer = 1

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        let props = this.props;
        return (
            <div>{props.children}</div>
        )
    }
}

const mapStateToProps = (state: any, ownProps: any) => ({
    
})

const mapDispatchToProps = (dispatch: any, ownProps: any) => ({
    
})

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Demo))