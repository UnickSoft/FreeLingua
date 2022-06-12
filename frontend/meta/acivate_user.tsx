declare var require: any
import * as React from "react"
import { translate, Translate } from 'react-i18nify';

var axios = require('axios');

export class ActivateUser extends React.Component<any, any> {
    state: {
        isActivated: any,
        isWrongLink: any
    };

    constructor(props) {
        super(props);

        this.state = {
            isActivated: false,
            isWrongLink: false
        };

        this.updateState();
    }

    updateState = () => {
        let self = this;
        axios.get("/activate_by_link", { params: { link: this.props.activateId } })
            .then(function (response) {
                self.setState({
                    isActivated: response.data.success, isWrongLink: !response.data.success
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    render() {
        return (
            <div>
                <h2>
                { !this.state.isActivated && !this.state.isWrongLink ?
                    <Translate value="activate.wait" /> :
                        this.state.isActivated ? <Translate value="activate.activated" /> :
                            <Translate value="activate.wrong_link" />
                    }
                </h2>
            </div>);
    }
}

export default ActivateUser;