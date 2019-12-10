import React, { Component } from 'react';

interface IState {
    [key: string]: any,
}
interface IProps {
    [key: string]: any,
}

class App extends Component<IProps, IState> {
    readonly state: Readonly<IState> = {
        
    }
    
    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div></div>
        )
    }
}

export default App