import React, {Component} from "react";
import {
    createClass,
    deleteClass,
    getAllClasses,
    updateTheClass,
} from "../../../../../model/classModel";
import '../../../styles/teacher_style.css';

export class ClassManagement extends Component{

    _isMount = false

    constructor() {
        super();

        this.state =  {

            classes:[],
            classesList : [],
            searchValue:"",
            editComponent:null


        }
    }


    componentDidMount() {
        this._isMount = true

        if(this._isMount)
        this.updateAllClasses()



    }

    updateAllClasses = ()=>{
       getAllClasses().then((response) => {

                console.log(response)
                this.setState({
                    classes: response.data.classes,
                })
                this.render()

            })

    }

    componentWillUnmount() {
        this._isMount = false
    }

    displayWaring = () =>{

    }

    //HANDLER
    handleDeleteClass   = (classID, name) => {



        this.props.displayWarning("êtes vous sûr de vouloir supprimer la classe "+name ,() => {
            deleteClass(classID).then(res => {
                console.log(res)
                this.props.closeWarning()
                this.updateAllClasses()
            })

        })
        //TODO update the list
    }

    handleCreateClass = (className, classGrade) => {


        createClass(className,classGrade).then((res) => {
            console.log(res)
            //this.updateAllClasses()
        })

    }

    handleEditClass = (id,className, classGrade) => {


        updateTheClass(id, className, classGrade).then((res) =>{

            this.updateClasses()

        })


    }

    handleSearchInputOnChange = (event) => {

        this.setState({
            searchValue : event.target.value
        })

    }

    handleCloseForm = () => {
        this.props.closeForm()
        //this.updateAllClasses()
    }


    displayForm = (id,name, grade) =>{


        if(id && name && grade){
            this.props.displayForm(<CreateForm type="edit" edit={this.handleEditClass} id={id} name={name} grade={grade} closeForm={this.handleCloseForm}/>)
        }else{
            this.props.displayForm(<CreateForm type="create" updateClasses={this.updateAllClasses} create={this.handleCreateClass} closeForm={this.handleCloseForm}/>)
        }


    }


    render() {

        return <>

            <div className="classManagement-container">

            <button onClick={this.displayForm} className="add-class-button">Ajouter</button>

            <input  className="class-search-input" onChange={this.handleSearchInputOnChange} placeholder="Rechercher..." value={this.state.searchValue} type="text" />


            <div className="classManagement-scroll">

                {this.state.classes.map((theClass, index) => {

                if(theClass.name.includes(this.state.searchValue) || this.state.searchValue=== "") {

                    return <Class
                        theClass={theClass}
                        edit={this.displayForm}
                        open={this.props.openClass}
                        key={index}
                        deleteClass={this.handleDeleteClass}
                    />
                }

            })}

            </div>

        </div>
            {this.state.editComponent}
        </>

    }


}




























////////////////////////////////// CLASS ////////////////////////////////////////////////////////
class Class extends Component{


    constructor() {
        super();

        this.state = {
            theClass : {
                classID:0,
                name:"",
                grade: "",
            },
            modificationIcon : window.location.origin + "/icons/edit-icon.png",
            gotoIcon : window.location.origin + "/icons/goto-icon.png",
        }


    }

    componentDidMount() {
        this.setState({
            theClass : this.props.theClass,
        })
    }

    handleOpen = () => {
        this.props.open(this.state.theClass)
    }

    handleEdit = () => {
        this.props.edit(this.state.theClass.classID,this.state.theClass.name, this.state.theClass.grade)
    }

    handleDelete = () =>{
        this.props.deleteClass(this.state.theClass.classID, this.state.theClass.name)
    }


    render() {

        return <>
            <div  className="class-container">

                <div className="class-control-section">
                    <img  className="class-delete-btn" src={window.location.origin + "/icons/delete-icon.png"} alt="delete"onClick={this.handleDelete}/>
                    <img  className="class-modify-btn" src={window.location.origin + "/icons/edit-icon.png"} alt="modify" onClick={this.handleEdit}/>
                    <img onClick={this.handleOpen} className="class-goto-btn" alt="go To" src={window.location.origin + "/icons/goto-icon.png"}/>
                </div>

                <label className="class-name-low">{this.state.theClass.name}</label>
                <label className="class-grade-low">{this.state.theClass.grade}</label>

            </div>
        </>

    }

}




class CreateForm extends Component{


    constructor() {
        super();

        this.state = {
            id:0,
            name :"",
            grade:""
        }
    }

    componentDidMount() {

        if(this.props.name && this.props.grade){
            this.setState({
                id:this.props.id,
                name:this.props.name,
                grade:this.props.grade
            })
        }


    }

    handleValidate = (event) => {



        if(this.props.type === "create"){


            if(this.state.name === "" || this.state.name === ""){
                alert("tout les champs doivent être remplis")
            }else{


                this.props.create(this.state.name, this.state.grade)
                //this.props.updateClasses()
                this.props.closeForm()



            }

        }else{
            if((this.state.name !== this.props.name) || (this.state.grade !== this.props.grade)) {
                this.props.edit(this.state.id, this.state.name, this.state.grade)

            }
            this.props.closeForm()
        }



        event.preventDefault();



    }

    handleNameChange = (event) => {
        this.setState({
            name : event.target.value
        })
    }

    handleGradeChange = (event) => {
        this.setState({
            grade : event.target.value
        })
    }


    render() {
       return <div className="class-creation-form-container">
            <form onSubmit={this.handleValidate}>
                <input className="edit-class-name-input" onChange={this.handleNameChange} value={this.state.name} type="text" placeholder="Nom"/>
                <input className="edit-class-grade-input" onChange={this.handleGradeChange} value={this.state.grade} type="text" placeholder="niveau"/>
                <div className="class-creation-button-section">
                    <input className="edit-class-cancel-btn"   onClick={this.props.closeForm}   type="button" value="annuler"/>
                    <input className="edit-class-validate-btn"  type="submit" value="valider"/>
                </div>
            </form>
        </div>
    }


}