import React from 'react';
import 'react-circular-progressbar/dist/styles.css';

import SelectorView from './SelectorView';
import { FunctionTextView } from './FunctionTextView';

import { Scrollbars } from 'react-custom-scrollbars';

class FunctionShareView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    onRepoChange = (repoID, repoName) => {
        const repoIDs = [];
        repoIDs.push(repoID);

        this.props.getFileList(repoIDs, repoName);
    };

    onFileChange = (filePath, fileName) => {
        this.props.getAllFunctions(this.props.selectedRepoID, filePath, fileName);
    };

    onFunctionChange = (functionName) => {
        this.props.getFunctionText(
            this.props.selectedRepoID,
            this.props.selectedFilePath,
            this.props.selectedFileName,
            functionName
        );
    };

    render() {
        const {
            repoArray,
            fileListLoaded,
            filesArr,
            selectedRepoID,
            functionsListLoaded,
            functionsArray,
            // functionTextLoaded,
            functionText,
            selectedRepoName,
            selectedFileName,
            selectedFunctionName
        } = this.props;

        return (
            <div className="functionShareCont">
                <div className="header">
                    <span className="bold">Function Share</span>
                    <p className="subHeader">
                        Share a part of your code with other users of this app to seek their help
                    </p>
                </div>

                <div className="buttonsCont">
                    <div className="primaryButton">Share Code</div>
                </div>

                <Scrollbars
                    style={{ width: '100%', height: '88%' }}
                    autoHide
                    autoHideTimeout={1000}
                    autoHideDuration={200}>
                    <div className="selectorsCont">
                        <SelectorView
                            title={'Repository'}
                            selectedValue={selectedRepoName || '--Select Repository--'}
                            list={repoArray}
                            id={'repositories'}
                            onChangeFn={this.onRepoChange}
                            selectedID={selectedRepoID}
                        />

                        {fileListLoaded && (
                            <SelectorView
                                title={'File'}
                                selectedValue={selectedFileName || '--Select File--'}
                                list={filesArr}
                                id={'files'}
                                onChangeFn={this.onFileChange}
                            />
                        )}

                        {functionsListLoaded && (
                            <SelectorView
                                title={'Function'}
                                selectedValue={selectedFunctionName || '--Select Function--'}
                                list={functionsArray}
                                id={'functions'}
                                onChangeFn={this.onFunctionChange}
                            />
                        )}
                    </div>

                    {true && (
                        <React.Fragment>
                            <div className="functionTextCont">
                                <FunctionTextView functionText={functionText} selectedFileName={selectedFileName} />
                            </div>
                        </React.Fragment>
                    )}
                </Scrollbars>
            </div>
        );
    }

    componentDidMount() {
        if (!this.props.repositoriesLoaded) {
            this.props.getRepositories(this.props.userID);
        }
    }
}

export default FunctionShareView;
