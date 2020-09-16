const { assert } = require('chai')
const { default: Web3 } = require('web3')

//import smart contract js file from /contracts
const SocialNetwork = artifacts.require('./SocialNetwork.sol')

//set reference to chai (defined inside package.json file)

require('chai')
    .use(require('chai-as-promised'))
    .should()

//create test skeleton with callback function
contract('SocialNetwork', ([deployer, author, tipper]) => { //accounts = acoounts in Ganache
    let socialNetwork
    
    //set variable of socialNetwork
    before(async () => {
        socialNetwork = await SocialNetwork.deployed()
    }) 
    
    //test social network deployed suite
    describe('deployment', async () => {

        it('deployed successfully', async () => {
            const address = await socialNetwork.address
            assert.notEqual(address, 0x0) //not blank
            assert.notEqual(address, '') //not empty
            assert.notEqual(address, null)
            assert.notEqual(address, undefined) 
        })

        //check social network has name
        it('has a name', async () => {
            const name = await socialNetwork.name()
            assert.equal(name, 'App Uni Social Network') 
        })
    }) 

    //test social newtork functionality suite
    describe('posts', async () => {
        let result, postCount

        before(async () => {
            result = await socialNetwork.createPost('This is my first post', { from: author })
            postCount = await socialNetwork.postCount()
        })

        it('creates posts', async () => {
            
            //SUCCESS CASE
            assert.equal(postCount, 1)
            const event = result.logs[0].args
                 // console.log(result) //inpsect result object
            
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(event.content, 'This is my first post', 'content is correct')
            assert.equal(event.tipAmount, '0', 'tip amount is correct')
            assert.equal(event.author, author, 'author is correct')

            //FAILURE CASES
            //blank posts
            await socialNetwork.createPost('', { from: author }).should.be.rejected
        })

        it('lists posts', async () => {
            const post = await socialNetwork.posts(postCount)

            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(post.content, 'This is my first post', 'content is correct')
            assert.equal(post.tipAmount, '0', 'tip amount is correct')
            assert.equal(post.author, author, 'author is correct')
        })

        it('allows users to tip post author', async () => {
            //track the author balance before post
            let oldAuthorBalance
            
            oldAuthorBalance = await web3.eth.getBalance(author) //get balance of author's wallet
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance) //BN === big number
            
            result = await socialNetwork.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

            //SUCCESS
            const event = result.logs[0].args
            
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(event.content, 'This is my first post', 'content is correct')
            assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
            assert.equal(event.author, author, 'author is correct')

            //check author balance after post
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            let tipAmount
            tipAmount = web3.utils.toWei('1', 'Ether')
            tipAmount = new web3.utils.BN(tipAmount)

            //test new balance is updated
            const expectedBalance = oldAuthorBalance.add(tipAmount)

            assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

            //FAILURE: Tries to tip non-existant post
            await socialNetwork.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
        })
    })
}) 
