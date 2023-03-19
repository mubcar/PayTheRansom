pragma solidity >=0.6.0 <0.8.0;

import "../client/node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../client/node_modules/openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";


contract EncryptedFileExchange {
    using SafeERC20 for IERC20;

    IERC20 public paymentToken;
    address payable public seller;
    bytes public encryptedFile;
    bytes public encryptedPrice;
    bool public isBuyerConfirmed;
    bool public isSellerConfirmed;

    event OfferMade(bytes encryptedFile, bytes encryptedPrice);
    event PaymentConfirmed(address buyer);
    event PaymentRefunded(address buyer);

    constructor(
        address _paymentToken,
        address payable _seller
    ) {
        paymentToken = IERC20(_paymentToken);
        seller = _seller;
        isBuyerConfirmed = false;
        isSellerConfirmed = false;
    }

    function makeOffer(bytes memory _encryptedFile, bytes memory _encryptedPrice) external {
        require(msg.sender == seller, "Only seller can make an offer");
        encryptedFile = _encryptedFile;
        encryptedPrice = _encryptedPrice;

        emit OfferMade(_encryptedFile, _encryptedPrice);
    }

    function confirmPayment() external {
        require(!isBuyerConfirmed, "Buyer has already confirmed payment");
        require(!isSellerConfirmed, "Seller has already confirmed payment");

        isBuyerConfirmed = true;

        emit PaymentConfirmed(msg.sender);
    }

    function refundPayment() external {
        require(isBuyerConfirmed, "Buyer has not confirmed payment");
        require(!isSellerConfirmed, "Seller has already confirmed payment");

        isBuyerConfirmed = false;

        // Refund the payment token to the buyer
        uint256 value = paymentToken.balanceOf(address(this));
        paymentToken.safeTransfer(msg.sender, value);

        emit PaymentRefunded(msg.sender);
    }

    function confirmOffer() external {
        require(msg.sender == seller, "Only seller can confirm offer");
        require(isBuyerConfirmed, "Buyer has not confirmed payment");

        isSellerConfirmed = true;

        // Transfer the payment token to the seller
        uint256 value = paymentToken.balanceOf(address(this));
        paymentToken.safeTransfer(seller, value);
    }
}
