import React from 'react';
import logo from './logo.svg';
import './App.less';
import cache from '@/utils/cache'

interface IProps {

}
interface IState {

}

class App extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    cache.set('a', 'React');
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
        </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            {cache.get('a')}
          </a>
        </header>
      </div>
    );
  }
}

export default App;
