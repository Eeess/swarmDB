import React from 'react';
import ReactDOM from 'react-dom';
import {addHooks} from '../../../react-webdriver';

class SimpleComponent extends React.Component {

    render() {
        return <div>{this.props.text}</div>;
    }

}

const root = ReactDOM.render(
    <SimpleComponent
        text='hello world'
        function={() => {}}/>,
    document.getElementById('react-root')
);


window.location.href.includes('noHooks')
    || addHooks(root, { SimpleComponent });