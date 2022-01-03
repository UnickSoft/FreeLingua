declare var require: any
import * as React from "react"
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';

var axios = require('axios');

export class VariantsList extends React.Component<any, any> {

    state: {
        globalIndex: any
    }

    onEditVariant = null;
    onAddVariant = null;
    onSetRight = null;
    onRemoveVariant = null;

    constructor(props) {
        super(props);

        this.state = {
            globalIndex: props.globalIndex
        };

        this.onAddVariant  = props.onAddVariant;
        this.onSetRight    = props.onSetRight;
        this.onEditVariant = props.onEditVariant;
        this.onRemoveVariant = props.onRemoveVariant;
    }

    pushLastEmpty = (variants) => {
        variants.push({ text: "", isRight: false });
    }

    setVariants = (index, text) => {        
        if (index == this.props.variants.length) {
            this.onAddVariant();
        }
        this.onEditVariant(index, text);
    }

    updateRightAnswer = (index, value) => {
        this.onSetRight(index, value);
    }

    removeAnswer = (index) => {
        this.onRemoveVariant(index);
    }

    render() {
        let index = -1;
        let self = this;
        let copy = this.props.variants.slice();
        this.pushLastEmpty(copy);

        return copy.map(function (answer) {
            index++;
            let locIndex = index;
            return (
                <div className="p-row" key={index}>
                    <div className="p-field p-grid" key={index}>
                        <label htmlFor={"answ_" + index + "_" + self.state.globalIndex} className="p-col-fixed" style={{ width: '32px' }}>{index + 1}.</label>
                        <div className="p-col-fixed" style={{ width: '300px' }}>
                            <InputText id={"answ_" + index + "_" + self.state.globalIndex} type="text" placeholder="Add new answer"
                                value={answer.text} onChange={(e) => self.setVariants(locIndex, e.target.value)} />
                        </div>
                        <div className="p-field-checkbox">
                            <Checkbox inputId={"cb" + index + "_" + self.state.globalIndex} value="Right" onChange={(e) => self.updateRightAnswer(locIndex, e.target.checked)}
                                checked={copy[locIndex].isRight} />
                            <label htmlFor={"cb1" + index + "_" + self.state.globalIndex} className="p-checkbox-label">Is right answer?</label>
                        </div>
                        <div>
                            <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text p-ml-4" onClick={(e) => self.removeAnswer(locIndex)}/>
                        </div>
                    </div>
                </div>
            )
        })
    }
}

export default VariantsList;