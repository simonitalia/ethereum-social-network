pragma solidity ^0.5.0;
//Functionality list
//create posts
//list posts
//tip author posts with crypto


//create new contract / class
contract SocialNetwork {
    //variables
    string public name;
    uint public postCount = 0; 
        //keep track of unique Posts
    
    mapping(uint => Post) public posts; 
        //key/value store to write data on the blockchain

    //create post data structure
    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }

    //define event to track vaues stored inside of Post object
    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    //
    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    //constructor method
    constructor() public {
        name = "App Uni Social Network";
    }

    //Post function
    function createPost(string memory _content) public {

        //set required check
        require(bytes(_content).length > 0);
            //connvert _content to bytes array and get its length
        
        //icrement post count
        postCount ++;

        //instantiate Post and add to mapping to write to blockchain
        posts[postCount] = Post(postCount, _content, 0, msg.sender);
            //posts is a key value pair, with postCount value === key

        //trigger event (same values as createPost function that's being tested)
        emit PostCreated(postCount, _content, 0, msg.sender);
    }


    function tipPost(uint _id) public payable {
        //check for valid id 
        require(_id > 0 && _id <= postCount);

        //fetch post
        Post memory _post = posts[_id];

        //fetch author
        address payable _author = _post.author;

        //pay author
        address(_author).transfer(msg.value);

        //increment tip amount
        _post.tipAmount = _post.tipAmount + msg.value;

        //update post
        posts[_id] = _post;

        //trigger post
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }
}