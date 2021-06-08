import React, { Component } from 'react'

export class CategoryButton extends Component {
    render() {
        return (
            <div>
                {!isEmpty(projectList) ?
                    <div className="categoriesNavigationDiv">
                        <div className={classnames("addCategoryDiv", {
                            "addCategoryDivActive": openAddCategory
                        })}>
                            <div className="addCategoryInputDiv">
                                <input
                                    ref={this.categoryInputRef}
                                    onKeyDown={function (e) {
                                        this.addCategoryShortcut(e, categoryText, this.categoryInputRef);
                                    }.bind(this)}
                                    type="text" placeholder="Type here" name="categoryText" onChange={function (e) { this.setState({ [e.target.name]: e.target.value }) }.bind(this)} />
                                <button className={classnames("closeAddCategoryBtn navBtn", {
                                    "closeAddCategoryBtnVisible": openAddCategory
                                })}
                                    onClick={function (e) { this.setState({ openAddCategory: false }) }.bind(this)}>{"<"}</button>
                                <button className="addCategoryBtn navBtn" onClick={function (e) { this.addCategory(categoryText, this.categoryInputRef) }.bind(this)}>Add</button>
                            </div>
                            <div className="newCategoryBtnDiv">
                                <button className="newCategoryBtn navBtn" onClick={function (e) { this.setState({ openAddCategory: true }); }.bind(this)}>New category</button>
                            </div>
                        </div>

                        {!isEmpty(categoryList) ?
                            <select className="categorysDropdown"
                                defaultValue={currentCategory}
                                onChange={function (e) { this.setCurrentCategory(e.target.value) }.bind(this)}
                            >
                                {categoryList.map(function (category, index) {
                                    return <option key={index}>{category.name}</option>
                                })}
                            </select>
                            : null}
                    </div>
                    : null
                }
            </div>
        )
    }
}

export default CategoryButton;