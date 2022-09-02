/* eslint-disable */
import { Button, Input, Col, Divider, Row, Descriptions } from "antd";
import { useContractLoader, useContractReader } from "eth-hooks";
import React, { useState, setState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Wallet from "./Wallet";
const { ethers } = require("ethers");
import readERC20Contract from '../helpers/loadERC20Contract';

export default function Market({
  customContract,
  account,
  address,
  gasPrice,
  signer,
  provider,
  name,
  show,
  blockExplorer,
  chainId,
  contractConfig,
  location,
}) {
  //input
  const [numTokensToMint, setNumTokensToMint] = useState("");
  const [numTokensToRepay, setNumTokensToRepay] = useState("");
  const [numTokensToRedeem, setNumTokensToRedeem] = useState("");
  const [decimals, setDecimals] = useState(undefined);
  const [underlyingBalance, setUnderlyingBalance] = useState("");
  const [tokenBondBalance, setTokenBondBalance] = useState("");

  // market info
  const [marketInfo, setMarketInfo] = useState(undefined);
  const contracts = useContractLoader(signer, contractConfig, chainId);

  let contract;
  if (!customContract) {
    contract = contracts ? contracts[name] : "";
  } else {
    contract = customContract;
  }

  let { underlying, maturity } = useParams();

  const asyncSetDecimals = async () => {
    let decimalsFromToken = await contracts["Token"].decimals();
    setDecimals(decimalsFromToken);
  };

  const readBalanceAndUpdateState = async (tokenAddress, func_to_update_balance) => {
    let erc20contract = await readERC20Contract(tokenAddress, provider);
    let balance = (await erc20contract.balanceOf(address)).toString();
    func_to_update_balance(balance);
  };

  const redeem = async () => {
    await executeContractCall(numTokensToRedeem, contract.redeem);
  };

  const repay = async () => {
    await executeContractCall(numTokensToRepay, contract.repay);
  };

  const mint = async () => {
   await executeContractCall(numTokensToMint, contract.mint);
  };

  const executeContractCall = async (numTokens, function_to_call) => {
    if (decimals === undefined) {
      await asyncSetDecimals();
    }
    let tokens = ethers.utils.parseUnits(numTokens, decimals);
    await function_to_call(underlying, maturity, tokens);
  };

  async function getMarketInfo() {
    let marketInfo = await contract.markets(underlying, maturity);
    setMarketInfo(marketInfo);
    readBalanceAndUpdateState(underlying, setUnderlyingBalance);
    readBalanceAndUpdateState(marketInfo.bond, setTokenBondBalance);
  }

  useEffect(() => {
    if (contracts[name] !== undefined) {
      getMarketInfo().catch(console.error);
      asyncSetDecimals().catch(console.error);
    }
  }, [contracts]);

  return (
    <>
      {marketInfo !== undefined && (
        <>
          <Descriptions title={`Market ${marketInfo.name}`} layout="horizontal" bordered style={{ margin: "10px" }}>
            <Descriptions.Item label="Underlying">
              {underlying}
            </Descriptions.Item>
            <Descriptions.Item label="Decimals (underlying)">{decimals}</Descriptions.Item>
            <Descriptions.Item label="Balance (underlying)">{underlyingBalance}</Descriptions.Item>
            <Descriptions.Item label="Maturity">{maturity}</Descriptions.Item>
            <Descriptions.Item label="Bond address">{marketInfo.bond}</Descriptions.Item>
            <Descriptions.Item label="Balance (bond)">{tokenBondBalance}</Descriptions.Item>
            <Descriptions.Item label="Price">{marketInfo.price.toString()}</Descriptions.Item>
            <Descriptions.Item label="maximumDebt">{marketInfo.maximumDebt.toString()}</Descriptions.Item>
            <Descriptions.Item label="mintedDebt">{marketInfo.mintedDebt.toString()}</Descriptions.Item>
            <Descriptions.Item label="claimedDebt">{marketInfo.claimedDebt.toString()}</Descriptions.Item>
          </Descriptions>
        </>
      )}

      <Divider>Mint token</Divider>

      <Input
        addonBefore="quantity (tokens) * 1e18"
        style={{ width: 600 }}
        value={numTokensToMint}
        onChange={e => setNumTokensToMint(e.target.value)}
      />
      <br />
      <Button type="primary" onClick={mint} disabled={numTokensToMint === ""}>
        Mint
      </Button>

      <Divider>Repay debt</Divider>

      <Input
        addonBefore="quantity (tokens) * 1e18"
        style={{ width: 600 }}
        value={numTokensToRepay}
        onChange={e => setNumTokensToRepay(e.target.value)}
      />
      <br />
      <Button type="primary" onClick={repay} disabled={numTokensToRepay === ""}>
        Repay
      </Button>

      <Divider>Redeem debt</Divider>

      <Input
        addonBefore="quantity (tokens) * 1e18"
        style={{ width: 600 }}
        value={numTokensToRedeem}
        onChange={e => setNumTokensToRedeem(e.target.value)}
      />
      <br />
      <Button type="primary" onClick={redeem} disabled={numTokensToRedeem === ""}>
        Repay
      </Button>
    </>
  );
}
