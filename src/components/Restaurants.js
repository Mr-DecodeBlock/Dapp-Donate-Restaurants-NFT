import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import Moralis from 'moralis';

import RestaurantsBlockchain from '../abis/Restaurants.json';
import { GlobalContext } from '../context/GlobalState';

function Restaurants({restaurants, ethPrice, loading, restaurantsBlockchainAddress, currentNetwork }){
  const { walletAddress } = useContext(GlobalContext);

  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(() => {
    getNFTsData(currentNetwork);
  }, [currentNetwork])

  async function getNFTsData(currentNetwork) {
    let networkId, networkType;

    if(currentNetwork === 'MATIC'){
      networkType = "mumbai";
      networkId = 80001;
    }
    else{
      networkId = 42;
      networkType = "kovan";
    }

    const options = { chain: networkType, address: RestaurantsBlockchain.networks[networkId].address };
    const tokenMetadata = await Moralis.Web3API.token.getNFTOwners(options);
    console.log(tokenMetadata);

    setTotalSupply(tokenMetadata.result.length);
  }

  const getUSDValue = restaurant => {
    const totalUSDValue = (ethPrice * +window.web3.utils.fromWei(restaurant.donationNeeded.toString(), 'Ether')) / 100000000;
    return <span className="badge badge-secondary donation-needed">Need ${Number.parseFloat(totalUSDValue).toFixed(2)}</span>
  }
  return(
    <div className="container" style={{ minHeight: '65vh'}}>
      <div className="jumbotron my-3">
        <h1>Support these restaurants</h1>
        <p className="lead mb-1">You can help them by donating some crypto and earn NFT</p>
        {restaurantsBlockchainAddress && <p className="text-muted">{totalSupply} NFTs has been minted on {currentNetwork} network</p>}
        <hr className="my-4"></hr>
        <p>If you are an restaurant owner that need funds, you can fill out the form to create a post</p>
        {walletAddress ? <p className="lead">
          <Link className="btn primary-bg-color btn-lg" to="/add-restaurant" role="button">Get Started</Link>
        </p> : <button className="btn secondary-bg-color btn-lg" data-toggle="modal" data-target="#walletModal" disabled={loading}>Open Wallet</button>
        }
      </div>

      <div className="row">
        {restaurants.map(restaurant => {
          return(
            <div className="col-12 col-md-6 col-lg-4 mb-3" key={restaurant.restaurantId}>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title">{restaurant.name}</h5>
                    <Link className="btn primary-bg-color" to={`/restaurant/${restaurant.restaurantId}`}>View</Link>
                  </div>
                  <p>{restaurant.location}</p>
                  <img
                    className="card-img-top"
                    src={restaurant.imageURL ? `https://ipfs.infura.io/ipfs/${restaurant.imageURL}` : '/images/no-image.png'}
                    alt="Restaurant" />
                  {getUSDValue(restaurant)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Restaurants;