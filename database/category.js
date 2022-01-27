'use strict';

class Category {
    constructor(dbWrapper) {
        this.dbWrapper = dbWrapper;
    }

    Table = "category"
    TableTemplateCategory = "templateCategory"
    publicCategoryName  = "public"
    privateCategoryName = "private"

    publicCategoryId  = -1;
    privateCategoryId = -1;

    init() {
        let self = this;

        let funcCheckPrivate = function () {
            self.dbWrapper.select_one(self.Table, { name: "title", value: self.privateCategoryName }, function (success, row) {
                if (success && row) {
                    self.privateCategoryId = row.id;
                } else {
                    self.dbWrapper.insert(self.Table, [{ name: "title", value: self.privateCategoryName }],
                        function (success, dbSelf) {
                            if (success) {
                                self.privateCategoryId = dbSelf.lastID;
                            }
                        });
                }
            });
        };

        self.dbWrapper.select_one(self.Table, { name: "title", value: self.publicCategoryName}, function (success, row) {
            if (success && row) {
                self.publicCategoryId = row.id;
                funcCheckPrivate();
            } else {
                self.dbWrapper.insert(self.Table, [{ name: "title", value: self.publicCategoryName }],
                    function (success, dbSelf) {
                    if (success) {
                        self.publicCategoryId = dbSelf.lastID;
                        funcCheckPrivate();
                    }
                });
            }
        });
    }

    getPublicCategories(func) {
        let self = this;
        self.dbWrapper.select_all(self.Table, { name: "isPublic", value: true }, function (success, rows) {
            func(rows);
        });
    }

    addPublicCategory(title, description, parent, func) {
        let self = this;

        if (parent == 0) {
            self.dbWrapper.insert(self.Table, [
                { name: "title", value: title },
                { name: "desc", value: description },
                { name: "parent", value: self.publicCategoryId },
                { name: "isPublic", value: true }],
                function (success, dbSelf) {
                    func(success);
                });
        } else {
            self.dbWrapper.select_one(self.Table, { name: "id", value: parent }, function (success, row) {
                if (success && row && row.isPublic) {
                    self.dbWrapper.insert(self.Table, [
                        { name: "title", value: title },
                        { name: "desc", value: description },
                        { name: "parent", value: parent },
                        { name: "isPublic", value: true }],
                        function (success, dbSelf) {
                            func(success);
                        });
                } else {
                    func(false);
                }
            });
        }
    }

    editPublicCategory(id, title, description, parent, func) {
        let self = this;

        if (parent == 0) {
            self.dbWrapper.update(self.Table, 
                [{ name: "title", value: title },
                { name: "desc", value: description },
                { name: "parent", value: self.publicCategoryId },
                { name: "isPublic", value: true }],
                { name: "id", value: id },
                function (success, dbSelf) {
                    func(success);
                });
        } else {
            self.dbWrapper.select_one(self.Table, { name: "id", value: parent }, function (success, row) {
                if (success && row && row.isPublic) {
                    self.dbWrapper.update(self.Table,
                        [{ name: "title", value: title },
                        { name: "desc", value: description },
                        { name: "parent", value: parent },
                        { name: "isPublic", value: true }],
                        { name: "id", value: id },
                        function (success, dbSelf) {
                            func(success);
                        });
                } else {
                    func(false);
                }
            });
        }
    }

    updatePublicCategorySort(id, sort, func) {
        let self = this;
        self.dbWrapper.update(self.Table,
            [{ name: "sort", value: sort }],
            [{ name: "id", value: id }, { name: "isPublic", value: true }],
            function (success, dbSelf) {
                func(success);
            });
    }

    deletePublicCategory(id, func) {
        let self = this;
        self.dbWrapper.delete(self.Table,
            [{ name: "id", value: id }, { name: "isPublic", value: true }],
            function (success, dbSelf) {
                func(success);
            });
    }

    setTemplateCategories(id, cats, func) {
        let self = this;
        self.dbWrapper.delete(self.TableTemplateCategory,
            [{ name: "template", value: id }],
            function (success, dbSelf) {
                if (success) {
                    let count = cats.length;
                    cats.forEach((cat) => {
                        self.dbWrapper.insert(self.TableTemplateCategory, [
                            { name: "template", value: id },
                            { name: "category", value: cat }],
                            function (success, dbSelf) {
                                count--;
                                if (count == 0) {
                                    func(success);
                                }
                            });
                    });
                    if (cats.length == 0) {
                        func(success);
                    }
                } else {
                    func(success);
                }
            });
    }

    getTemplateCategories(id, func) {
        let self = this;
        self.dbWrapper.select_all(self.TableTemplateCategory, { name: "template", value: id }, function (success, rows) {
            if (success) {
                func(success, rows.map((row => row.category)));
            } else {
                func(success, []);
            }
        });
    }

    isCategoryPublic(id, func) {
        let self = this;

        self.dbWrapper.select_one(self.Table, [
            { name: "id", value: id },
            { name: "isPublic", value: true }],
            function (success, row) {
                func(success, row != null);
        });
    }

    getTemplatePublicCategory(id, func) {
        let self = this;
        self.dbWrapper.select_one(self.Table,
            [{ name: "id", value: id }, { name: "isPublic", value: true }],
            function (success, row) {
                if (success) {
                    self.dbWrapper.select_one(self.Table,
                        [{ name: "id", value: row.parent }, { name: "isPublic", value: true }],
                        function (success, rowParent) {
                            if (success) {
                                row.parentTitle = rowParent ? rowParent.title : "";
                                func(success, row);
                            } else {
                                func(success, null)
                            }
                        });
            } else {
                func(success, null)
            }
        });
    }

    getTemplatesInPublicCategory(id, templatesTable, func) {
        let self = this;
        this.isCategoryPublic(id, function (success, isPublic) {
            if (success && isPublic) {
                self.dbWrapper.select_all_raw(
                    "SELECT temp.id as id, temp.title as title, temp_cat.sort as sort, temp_cat.category as category FROM " +
                    self.TableTemplateCategory + " AS temp_cat, " +
                    templatesTable.Table + " AS temp" +
                    " WHERE temp.id=temp_cat.template AND temp_cat.category=?",
                    [id], function (success, rows) {
                        if (success) {
                            func(success, rows);
                        }
                });
            } else {
                func(false);
            }
        });
    }

    setTemplatePublicCategorySort(templateId, categoryId, sort, func) {
        let self = this;
        self.dbWrapper.update(self.TableTemplateCategory,
            [{ name: "sort", value: sort }],
            [{ name: "template", value: templateId }, { name: "category", value: categoryId }],
            function (success, dbSelf) {
                func(success);
            });
    }

    getChildrenPublicCategories(categoryId, func) {
        let self = this;
        self.dbWrapper.select_all(self.Table, [{ name: "isPublic", value: true }, { name: "parent", value: categoryId }],
            function (success, rows) {
                func(success, rows);
        });
    }
}

module.exports = Category