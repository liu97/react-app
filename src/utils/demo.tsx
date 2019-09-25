import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

interface IState {
    [key: string]: any,
}
interface IProps {
    [key: string]: any,
}

class Demo extends Component<IProps, IState> {
    readonly state: Readonly<IState> = {
        username: '',
        password: '',
    }
    private refDiv = React.createRef<HTMLDivElement>()

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        let props = this.props;
        return (
            <div ref={this.refDiv}>{props.children}</div>
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