import React, { Component } from 'react';
import axios from 'axios';
import './mainPage.css'


let repoCollector = []
let sortedContributors = []
let newCompany = ''

class MainPage extends Component {
    constructor(props) {
      super(props);
      this.state = {
        company: `github`,
        repos_url: '',
        mostForked: [],
        topStarred: [],
        repoWithContributors: [],
        userWithContribution: [],
        allContributors: [],
      };
      this.fetchData = this.fetchData.bind(this);
      this.fetchRepoData = this.fetchRepoData.bind(this)
      this.getterFunc = this.getterFunc.bind(this)
      this.getMembers = this.getMembers.bind(this)
      this.getOutsideContributors = this.getOutsideContributors.bind(this)
      this.handleChange = this.handleChange.bind(this)
      this.submitNewCompany = this.submitNewCompany.bind(this)
    }
  
    fetchData() {
      return axios
        .get(
          `https://api.github.com/users/${this.state.company}`
        )
        .then(res => {
          res.data;
          this.setState({
            repos_url: res.data.repos_url
          })
        })
        .catch(err => console.error("Fetching data failed", err));
    }

    fetchStarData(){
      return axios
      .get(
        this.state.repos_url
      ).then( res=> {
        this.setState({
          topStarred: res.data.sort(
            function(a, b) {
              return b.stargazers_count - a.stargazers_count;
            }
          )
        })
      })
    }

    fetchRepoData(){
        return axios
        .get(
            this.state.repos_url
        )
        .then(res => {
            this.setState({ 
              mostForked: res.data.sort(
                function(a, b) {
                return b.forks - a.forks;
                }
            )
          })
          return res
        })
          .then( res => {
            (res.data.forEach(function(repo){
              repoCollector.push(repo.contributors_url)
            }))
            return repoCollector
          })
          .then(res=>{
            const arr = []
            for(let i =0; i< res.length; i++){
              arr.push(this.getterFunc(res[i]))
            }
            return Promise.all(arr)
          })
          .then(res => {
            sortedContributors = (
              res.sort(function(a,b){
                return b[1].length - a[1].length
              }))
              this.setState({
                repoWithContributors: sortedContributors
              }
            )
            }
          )
    }

    getterFunc(url){
      return axios.get(
        url
      ).then(res => {
        return [url, res.data]
      }
      )
    }

    getMembers(){
      return axios.get(
        `https://api.github.com/orgs/${this.state.company}/members`
      ).then( res=> {
        let userScores = []
        res.data.forEach(element=>{
          const username = element.login
          let userVal = this.crawlAndCountContributors(username)
          userScores.push([username, userVal])
        })
        let sortedScores = userScores.sort((a,b) =>
           b[1] - a[1]
        )
        this.setState({
          userWithContribution: sortedScores
        })
      }
      )
    }

    getOutsideContributors(){ //lacking authorization to pull from https://api.github.com/orgs/:orgs/outside_collaborators
      let allContributors=[]
      this.state.repoWithContributors.forEach(function(repoWithContributor){
        repoWithContributor[1].forEach(function(userObject){
          allContributors.push(userObject)
        })
      })
      let sortedAllContributors = allContributors.sort(function(a, b){
        return b.contributions - a.contributions
      })
      this.setState({
        allContributors: sortedAllContributors
      })
    }

     crawlAndCountContributors(name){
       let count = 0;
       this.state.repoWithContributors.forEach(contributor => {
         contributor[1].forEach(userObj=> {
           if(userObj.login === name){
             count += userObj.contributions
           }
         })
       })
       return count
    }

    handleChange(event){
      newCompany = event.target.value
    }

    submitNewCompany(){
      if(newCompany.length > 2)
      this.setState({
        company: newCompany
      })
    }
  
    async componentWillMount() {
      await this.fetchData();
      await this.fetchStarData();
      await this.fetchRepoData();
      await this.getMembers()
      await this.getOutsideContributors()
    }
  
    render() {
      let contributorRepoName = this.state.allContributors.length ? this.state.repoWithContributors.map((repo)=>{
        let splitRepo = repo[0].split('/')
        return splitRepo[splitRepo.length-2]
      }) : null;

      return (
        <div>
        { this.state.allContributors.length ? 
        <div>
          <div className='search'>
            <input
            onChange={this.handleChange}
            type="text"
            placeholder="New Company"
            />
            <button type='submit' onClick={this.submitNewCompany}>See New Company</button>
            </div>
        <div className='main-data-container'>
        <div className= 'data-record'>
        <h1>{this.state.company.slice(0, 1).toUpperCase() + this.state.company.slice(1)}'s Most Forked Repos</h1>
          <h2>1. {this.state.mostForked[0].name}: {this.state.mostForked[0].forks} forks</h2>
          <h2>2. {this.state.mostForked[1].name}: {this.state.mostForked[1].forks} forks</h2>
          <h2>3. {this.state.mostForked[2].name}: {this.state.mostForked[2].forks} forks</h2>
          <h2>4. {this.state.mostForked[3].name}: {this.state.mostForked[3].forks} forks</h2>
        </div> 
        <div className= 'data-record'>
          <h1>{this.state.company.slice(0, 1).toUpperCase() + this.state.company.slice(1)}'s Top Starred Repos</h1>
          <h2>1. {this.state.topStarred[0].name}: {this.state.topStarred[0].stargazers_count} stars</h2>
          <h2>2. {this.state.topStarred[1].name}: {this.state.topStarred[1].stargazers_count} stars</h2>
          <h2>3. {this.state.topStarred[2].name}: {this.state.topStarred[2].stargazers_count} stars</h2>
          <h2>4. {this.state.topStarred[3].name}: {this.state.topStarred[3].stargazers_count} stars</h2>
        </div>
        <div className= 'data-record'>
        <h1>{this.state.company.slice(0, 1).toUpperCase() + this.state.company.slice(1)}'s Top Repositories by Contributors</h1>
        <h2>1. {contributorRepoName[0]}: {this.state.repoWithContributors[0][1].length} different contributors</h2>
        <h2>2. {contributorRepoName[1]}: {this.state.repoWithContributors[1][1].length} different contributors</h2>
        <h2>3. {contributorRepoName[2]}: {this.state.repoWithContributors[2][1].length} different contributors</h2>
        <h2>4. {contributorRepoName[3]}: {this.state.repoWithContributors[3][1].length} different contributors</h2>
        </div>
        <div className= 'data-record'>
        <h1>{this.state.company.slice(0, 1).toUpperCase() + this.state.company.slice(1)}'s Members with Most Contributions</h1>
        <h2>1. {this.state.userWithContribution[0][0]}: {this.state.userWithContribution[0][1]} contributions</h2>
        <h2>2. {this.state.userWithContribution[1][0]}: {this.state.userWithContribution[1][1]} contributions</h2>
        <h2>3. {this.state.userWithContribution[2][0]}: {this.state.userWithContribution[2][1]} contributions</h2>
        <h2>4. {this.state.userWithContribution[3][0]}: {this.state.userWithContribution[3][1]} contributions</h2>
        </div>
        <div className= 'data-record'>
        <h1>{this.state.company.slice(0, 1).toUpperCase() + this.state.company.slice(1)}'s Non-Members with Most Contributions</h1>
        <h2>1. {this.state.allContributors[0].login}: {this.state.allContributors[0].contributions} contributions</h2>
        <h2>2. {this.state.allContributors[1].login}: {this.state.allContributors[1].contributions} contributions</h2>
        <h2>3. {this.state.allContributors[2].login}: {this.state.allContributors[2].contributions} contributions</h2>
        <h2>4. {this.state.allContributors[3].login}: {this.state.allContributors[3].contributions} contributions</h2>
        </div>
        </div>
        </div>
        : null}
        </div>
      );
    }
  }
  
  export default MainPage;