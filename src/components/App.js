import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import  SocialNetwork from '../abis/SocialNetwork.json' //import smart contract dApp
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  //connect web app to blockchain app
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }

    //check metamask extension is installed on chrome browser
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    
    //load account
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })

    //get blockchain network ID
    const networkId = await web3.eth.net.getId()
    const networkData = SocialNetwork.networks[networkId]
    if(networkData) {
      console.log(networkId)
      
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address)
      this.setState({ socialNetwork }) //can just reference key name if an object's key name and value are the same
      
      const postCount = await socialNetwork.methods.postCount().call() //.call will call the method v just returning it
      this.setState({ postCount })
      console.log(postCount)

      //load posts
      for (var i = 1; i <= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post] //appends fetched posts to end of posts array
        })
      }

      //Sort posts based on tipped amount (highest to lowest)
      this.setState({
        posts: this.state.posts.sort((a, b) => b.tipAmount - a.tipAmount )
      })

      // console.log({ posts: this.state.posts })
      this.setState({ loading: false })

    } else {
      window.alert('SocalNetwork contract not found! Has it been deployed to the private blockchain?')
    }
  }


  createPost(content) {
    this.setState({ loading: true })
    this.state.socialNetwork.methods.createPost(content).send({ from: this.state.account })

    .once('receipt', (receipt) => {
    this.setState({ loading: false })
    })

  }


  tipPost(id, tipAmount) {
    this.setState({ loading: true })
    this.state.socialNetwork.methods.tipPost(id).send({ from: this.state.account, value: tipAmount })
    
    .once('receipt', (receipt) => {
      this.setState({ loading: false})
    })

  }

  constructor(props) { //props === component properties
    super(props)
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: false 
    }

    this.createPost = this.createPost.bind(this)
    this.tipPost = this.tipPost.bind(this)
  }

  
  render() {
    return (
      <div>
        <Navbar account={ this.state.account } />
        { this.state.loading 
          ? <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
          : <Main 
              posts={ this.state.posts } 
              createPost={ this.createPost }
              tipPost={ this.tipPost }
            />
        }
      </div>
    );
  }
}

export default App;
