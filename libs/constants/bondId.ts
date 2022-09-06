// BondId from the available bonds:
// Currently the bondIds avaialable can be check directly from the page https://app.ripprotocoldao.finance/#/bonds by clicking on any bond or by
// calling Depository.liveMarkets() @ 0xC0aefc672BC66c6A9739F0f02d33b9Ac1BAD653D
// 13 => FRAX
// 11 => UST
// 12 => DAI

/* eslint-disable no-unused-vars */
enum BondId {
  UST = 11,
  DAI = 12,
  FRAX = 13,
}

export default BondId;
