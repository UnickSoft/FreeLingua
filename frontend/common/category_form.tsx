declare var require: any
import * as React from "react"
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class CategoryFrom extends React.Component<any, any> {
    state: {
        categoryId: any
        categories: any
        parent: any
        title: any
        description: any
        isPublic: any
        isEditMode: any
    };

    onSuccessFunc = null;
    onCloseFunc   = null;

    constructor(props) {
        super(props);
        this.state = {
            categoryId: props.categoryData != null ? props.categoryData.id : null,
            categories: [{ name: "No parent", value: "no_parent" }],
            parent: props.categoryData != null && !props.categoryData.isParentRoot ? props.categoryData.parent : "no_parent",
            title: props.categoryData != null ? props.categoryData.title : "",
            description: props.categoryData != null ? props.categoryData.desc : "",
            isPublic: true,
            isEditMode: props.categoryData != null
        };
        if ("onSuccess" in props) {
            this.onSuccessFunc = props.onSuccess;
        }
        if ("onClose" in props) {
            this.onCloseFunc = props.onClose;
        }
        if ("categories" in props) {
            props.categories.forEach((cat => {
                this.state.categories.push({ name: cat.title, value: cat.id });
            }));
        }        
    }

    onSave = () => {
        let self = this;
        (this.state.isEditMode ? 
            axios.post("/admin/edit_public_category",
                {
                    id: this.state.categoryId,
                    title: this.state.title,
                    description: this.state.description,
                    parent: this.state.parent == "no_parent" ? 0 : this.state.parent
                })
            :
            axios.post("/admin/add_public_category",
                {
                    title: this.state.title,
                    description: this.state.description,
                    parent: this.state.parent == "no_parent" ? 0 : this.state.parent
                })
            ).then(function (response) {
                    if (response.data.success) {
                        self.setState({
                            title: "",
                            description: "",
                            parent: "no_parent"
                        });
                        self.onSuccessFunc();
                    }
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                });
    }

    renderFooter() {
        return (
            <div>
                <Button label={"Save"} icon="pi pi-check" onClick={this.onSave} autoFocus />
            </div>
        );
    }

    render() {
        let self = this;
        return (<Dialog header={"Category form"} visible={true} style={{ width: '50vw' }}
            footer={this.renderFooter()}
            onHide={this.onCloseFunc}>
            <div className="p-fluid">
                <div className="p-field">
                    <InputText name="title" type="text" id="title" placeholder={"Please enter title"}
                        value={this.state.title}
                        onChange={(e) => { self.setState({ title: e.target.value }) }} />
                </div>
                <div className="p-field">
                    <InputText name="description" id="description" placeholder={"Please enter description"}
                        value={this.state.description}
                        onChange={(e) => { self.setState({ description: e.target.value }) }} />
                </div>
                <div className="p-field">
                    <Dropdown optionLabel="name" value={this.state.parent} options={this.state.categories}
                        placeholder="Select parent category"
                        onChange={(e) => { self.setState({ parent: e.value }) }}
                    />
                </div>                
            </div>
        </Dialog>);
    }
}

export default CategoryFrom;