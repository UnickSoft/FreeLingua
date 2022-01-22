declare var require: any
import * as React from "react"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { CategoryFrom } from '../common/category_form';
import { SortDialog } from '../common/sort_dialog';

var ReactDOM = require('react-dom');
var axios    = require('axios');

export class PublicCategoryTable extends React.Component<any, any> {
    state: {
        categories: any,
        showCatDialog: any,
        categoryData: any,
        showSortDialog: any,
        showSortTaskDialog: any
    };

    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            showCatDialog: false,
            categoryData: null,
            showSortDialog: false,
            showSortTaskDialog: false
        };

        this.updatePublicCategories();
    }

    updatePublicCategories = () => {
        let self = this;
        axios.get("/admin/get_public_categories", {})
            .then(function (response) {
                self.setState({ categories: self.processCategories(response.data.categories)});
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
    }

    processCategories = (categories) => {
        let res = [];
        let catById = {};

        categories.forEach((cat) => {
            catById[cat.id] = cat.title;
        });

        categories.forEach((cat) => {
            let c = cat;
            if (cat.parent in catById) {
                c.parentTitle = catById[cat.parent];
            } else {
                c.parentTitle = "NOT FOUND";
                c.isParentRoot = true;
            }
            res.push(c);
        });

        return res;
    }

    deleteCategory = (id) => {
        let self = this;
        axios.post("/admin/delete_public_category", { id: id })
            .then(function (response) {
                self.updatePublicCategories();
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    deleteBody = (value) => {
        let self = this;
        return <Button onClick={(e) => self.deleteCategory(value.id)}>Delete</Button>
    }    

    openSettingsBody = (value) => {
        let self = this;
        return <Button onClick={(e) => self.editDialog(value)}>Open</Button>
    }

    sortBody = (value) => {
        let self = this;
        return <Button onClick={(e) => self.sortDialog(value.parent)}>Sort</Button>
    }

    sortTasksBody = (value) => {
        let self = this;
        return <Button onClick={(e) => self.sortTasksDialog(value.id)}>Sort</Button>
    }    

    hideDialog = () => {
        this.setState({ showCatDialog: false, showSortDialog: false, showSortTaskDialog: false, categoryData: null });
    }

    addDialog = () => {
        this.setState({ showCatDialog: true, categoryData: null });
    }

    sortDialog = (parent) => {
        let categoryData = this.state.categories.filter((obj) => obj.parent == parent);
        let a = categoryData.sort((a, b) => a.sort > b.sort ? 1 : -1);
        this.setState({ showSortDialog: true, categoryData: a });
    }

    sortTasksDialog = (categoryId) => {
        let self = this;
        axios.get("/classroom/get_public_category_templates", { params: { id: categoryId}})
            .then(function (response) {
                let templates = response.data.templates.sort((a, b) => a.sort > b.sort ? 1 : -1);;
                self.setState({ showSortTaskDialog: true,  categoryData: templates });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }    

    editDialog = (data) => {
        this.setState({ showCatDialog: true, categoryData: data });
    }

    itemTemplateSort = (item) => {
        return (<span>{item.title}</span>)
    }

    processSortOrder = (list) => {
        let self = this;
        let index = 0;
        let sent = 0;
        list.forEach((element) => {
            if (element.sort != index) {
                sent++;
                axios.post("/admin/update_public_category_sort", { id: element.id, sort: index})
                    .then(function (response) {
                        sent--;
                        if (sent == 0) {
                            self.updatePublicCategories();
                        }
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                    });
            }
            index++;
        });
    }

    processSortTasksOrder = (list) => {
        let self = this;
        let index = 0;
        let sent = 0;
        list.forEach((element) => {
            if (element.sort != index) {
                sent++;
                axios.post("/admin/update_template_public_category_sort", { template: element.id, category: element.category, sort: index })
                    .then(function (response) {
                        // do nothing
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                    });
            }
            index++;
        });
    }    
    
    render() {
        let self = this;

        return (<div className="card">
            <DataTable value={this.state.categories}>
                <Column field="title" header="Title"></Column>
                <Column field="parentTitle" header="Parent"></Column>
                <Column header="Settings" body={this.openSettingsBody}></Column>
                <Column header="Sort categories" body={this.sortBody}></Column>
                <Column header="Sort tasks"      body={this.sortTasksBody}></Column>
                <Column header="Delete" body={this.deleteBody} ></Column>
            </DataTable>
            <Button onClick={(e) => { self.addDialog() }}>Add category</Button>
            {this.state.showCatDialog ? <CategoryFrom
                onClose={() => { self.hideDialog() }}
                onSuccess={() => {
                    self.updatePublicCategories();
                    self.hideDialog();
                }}
                categories={this.state.categories}
                categoryData={this.state.categoryData}
            />
                : null}

            {this.state.showSortDialog || this.state.showSortTaskDialog ? <SortDialog
                onClose={() => { self.hideDialog() }}
                onSuccess={(newList) => {
                    if (this.state.showSortTaskDialog) {
                        self.processSortTasksOrder(newList);                        
                    } else {
                        self.processSortOrder(newList);
                    }
                    self.hideDialog();
                }}
                list={this.state.categoryData}
                itemTemplate={this.itemTemplateSort}
                title="Sort list"
            />
                : null}
        </div>);
    }
}

export default PublicCategoryTable;