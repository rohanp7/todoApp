import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
// import ListItemView from './ListItemView'

import { AiFillCaretDown } from 'react-icons/ai';

class SelectorView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listOpened: false
        };
    }

    toggleList = () => {
        this.setState({
            listOpened: !this.state.listOpened
        });
    };

    onListItemClick = (event) => {
        this.props.onChangeFn(event.target.id, event.target.innerText);

        // this.props.onChangeFn(id);
        // if ListItemView is used we will get id here directly
    };

    render() {
        const { list, selectedValue, title } = this.props;
        const totalItems = list.length;
        let currentItem;

        const listArr = [];
        for (var i = 0; i < totalItems; i++) {
            currentItem = list[i];

            // <ListItemView key={Math.random()} item={currentItem} onListItemClick={this.onListItemClick} />
            // use ListItemView if there is a space in the name or if id should not be attached to DOM

            listArr.push(
                <li key={Math.random()} id={currentItem.id}>
                    {currentItem.name}
                </li>
            );
        }

        return (
            <div className="selectorCont">
                <div className="selectedValue" onClick={this.toggleList}>
                    <p className="medium title">{title}: </p>
                    <p title={selectedValue} className="value">
                        {selectedValue}
                    </p>

                    <p className="dropDownArrow">
                        <AiFillCaretDown />
                    </p>
                </div>

                <div className={this.state.listOpened ? 'listCont expanded' : 'listCont collapsed'}>
                    <ul
                        onMouseUp={(event) => {
                            this.onListItemClick(event);
                        }}>
                        <Scrollbars style={{ width: '100%' }} autoHeight autoHeightMax={130}>
                            {listArr}
                        </Scrollbars>
                    </ul>
                </div>
            </div>
        );
    }

    componentDidUpdate() {}
}

export default SelectorView;
