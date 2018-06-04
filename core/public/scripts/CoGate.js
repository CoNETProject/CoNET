const Stripe_publicKey = 'pk_live_VwEPmqkSAjDyjdia7xn4rAK9';
class coGateRegion {
    constructor(region, dataTransfer, account, exit) {
        this.region = region;
        this.dataTransfer = dataTransfer;
        this.account = account;
        this.exit = exit;
        this.QTConnectData = ko.observable(null);
        this.QTGateConnect1 = ko.observable('1');
        this.showQTGateConnectOption = ko.observable(false);
        this.QTGateMultipleGateway = ko.observable(1);
        this.QTGateMultipleGatewayPool = ko.observableArray([1, 2, 4]);
        this.isFreeUser = ko.observable(/free/i.test(this.dataTransfer.productionPackage));
        this.QTGateGatewayPortError = ko.observable(false);
        this.requestPortNumber = ko.observable('80');
        this.QTGateLocalProxyPort = ko.observable('3001');
        this.localProxyPortError = ko.observable(false);
        this.QTGateConnect2 = ko.observable(false);
        this.WebRTCleak = ko.observable(true);
        this.doingProcessBarTime = null;
        this.error = ko.observable(-1);
        this.CoGateConnerting = ko.observable(false);
        this.disconnecting = ko.observable(false);
        const self = this;
        socketIo.emit11('checkPort', '3001', (err, nextPort) => {
            if (err) {
                self.QTGateLocalProxyPort(nextPort);
            }
        });
        this.requestPortNumber.subscribe(function (newValue) {
            const uu = parseInt(newValue);
            self.QTGateGatewayPortError(false);
            if (!newValue) {
                return self.requestPortNumber('80');
            }
            if (uu < 1 || uu > 65535 || uu === 22) {
                self.QTGateGatewayPortError(true);
                return $('.popupInput').popup({
                    on: 'focus',
                    movePopup: false,
                    position: 'top left',
                    inline: true
                });
            }
        });
        this.QTGateLocalProxyPort.subscribe(function (newValue) {
            const uu = parseInt(newValue);
            self.localProxyPortError(false);
            if (!newValue) {
                return self.requestPortNumber('3001');
            }
            if (uu < 3000 || uu > 65535) {
                self.localProxyPortError(true);
                return $('.popupInput').popup({
                    on: 'focus',
                    movePopup: false,
                    position: 'top left',
                    inline: true
                });
            }
            return socketIo.emit11('checkPort', newValue, err => {
                return self.localProxyPortError(err);
            });
        });
    }
    upgradeAccount() {
    }
    showQTGateConnectOptionClick() {
        this.showQTGateConnectOption(!this.showQTGateConnectOption());
        if (this.WebRTCleak()) {
            $('.checkboxWebRTC').checkbox('set checked');
        }
        else {
            $('.checkboxWebRTC').checkbox('set unchecked');
        }
    }
    QTGateGatewayConnectRequestCallBack(error, connectCommand) {
        clearTimeout(this.doingProcessBarTime);
        this.CoGateConnerting(false);
        if (typeof error === 'number' && error > -1) {
            //this.QTGateConnectRegionActive ( true )
            //this.QTGateGatewayActiveProcess ( false )
            this.error(error);
            return;
        }
        const data1 = connectCommand[0];
        if (data1) {
            //this.QTTransferData ( data1.transferData )
            return this.QTConnectData(data1);
        }
    }
    QTGateGatewayConnectRequest() {
        const self = this;
        const connect = {
            account: this.dataTransfer.account,
            imapData: null,
            gateWayIpAddress: null,
            region: this.region.qtRegion,
            connectType: this.QTGateConnect1() === '1' ? 2 : 1,
            localServerPort: this.QTGateLocalProxyPort(),
            AllDataToGateway: !this.QTGateConnect2(),
            error: null,
            fingerprint: null,
            localServerIp: null,
            multipleGateway: [],
            requestPortNumber: this.requestPortNumber(),
            requestMultipleGateway: this.QTGateMultipleGateway(),
            webWrt: this.WebRTCleak()
        };
        this.CoGateConnerting(true);
        socketIo.emit11('QTGateGatewayConnectRequest', connect);
        return false;
    }
    showUserInfoMacOS() {
    }
    disconnectClick() {
        socketIo.emit11('disconnectClick');
        this.QTConnectData(null);
        this.exit();
    }
}
class CoGateClass {
    constructor() {
        this.QTGateRegions = ko.observableArray(_QTGateRegions);
        this.reloading = ko.observable(true);
        this.CoGateRegion = ko.observable(null);
        this.showCards = ko.observable(true);
        this.QTTransferData = ko.observable();
        this.pingCheckLoading = ko.observable(false);
        this.pingError = ko.observable(false);
        this.doingCommand = false;
        this.freeAccount = ko.observable(true);
        this.CoGateAccount = ko.observable(null);
        const self = this;
        this.reloadRegion();
        socketIo.on('pingCheck', function (region, ping) {
            return self.pingCheckReturn(region, ping);
        });
        socketIo.on('QTGateGatewayConnectRequest', function (err, cmd) {
            if (!self.CoGateRegion) {
                let uuu = null;
                const region = cmd[0].region;
                const regionIndex = self.QTGateRegions().findIndex(function (n) {
                    return n.qtRegion === region;
                });
                const uu = self.QTGateRegions()[regionIndex];
                self.CoGateRegion(uuu = new coGateRegion(uu, self.QTTransferData(), function () {
                    self.account();
                }, function () {
                    self.CoGateRegion(uuu = null);
                    return self.showCards(true);
                }));
            }
            return self.CoGateRegion().QTGateGatewayConnectRequestCallBack(err, cmd);
        });
        socketIo.on('containerStop', function () {
        });
    }
    getAvaliableRegionCallBack(region, dataTransfer, config) {
        this.showCards(true);
        this.QTGateRegions().forEach(function (n) {
            const index = region.findIndex(function (nn) { return nn === n.qtRegion; });
            if (index < 0)
                return n.available(false);
            return n.available(true);
        });
        this.QTGateRegions.sort(function (a, b) {
            if (a.available() === b.available())
                return 0;
            if (b.available() && !a.available()) {
                return 1;
            }
            return -1;
        });
        this.reloading(false);
        this.doingCommand = false;
        dataTransfer.promo = dataTransfer.promo || ['对折促销月：选择年付费送一年服务', '今月中プロモーション：50%オフ、一年払いと次年度フリー', 'Promotion 50% off:  Annual user will get next free year.', '對折促銷月：選擇年付費送一年服務'];
        dataTransfer.promoPrice = 0.5;
        this.QTTransferData(dataTransfer);
        this.freeAccount(/^free$/i.test(dataTransfer.productionPackage));
        /*
        const uu = checkCanDoAtQTGate ( this.emailPool )
        if ( uu > -1 ) {
            this.QTGateConnectSelectImap ( uu )
            this.canDoAtEmail ( true )
            this.showQTGateImapAccount ( false )
        } else {
            this.QTGateConnectSelectImap (0)
        }
        */
        $('.ui.dropdown').dropdown();
        /*
        this.QTTransferData ( dataTransfer )
        this.config ( config )
        this.showRegionData ( true )
        this.QTGateRegionInfo ( false )
        this.pingCheckLoading( false )
        return clearTimeout ( this.doingProcessBarTime )
        */
    }
    reloadRegion() {
        const self = this;
        this.reloading(true);
        this.doingCommand = true;
        socketIo.emit11('getAvaliableRegion', function (region, dataTransfer, config) {
            if (region && region.length) {
                return self.getAvaliableRegionCallBack(region, dataTransfer, config);
            }
        });
    }
    pingCheckReturn(region, ping) {
        const index = this.QTGateRegions().findIndex(function (n) { return n.qtRegion === region; });
        if (index < 0)
            return;
        const _reg = this.QTGateRegions()[index];
        if (!_reg.available)
            return;
        _reg.ping(ping);
        const fromIInputData = $(`#card-${_reg.qtRegion.replace('.', '-')}`);
        const uu = ping;
        const _ping = Math.round((500 - ping) / 100);
        fromIInputData.rating({
            initialRating: _ping > 0 ? _ping : 0
        }).rating('disable');
    }
    CardClick(index) {
        const self = this;
        const uu = this.QTGateRegions()[index];
        let uuu = null;
        this.CoGateRegion(uuu = new coGateRegion(uu, this.QTTransferData(), function () {
            self.account();
        }, function () {
            self.CoGateRegion(uuu = null);
            return self.showCards(true);
        }));
        this.showCards(false);
        $('.ui.checkbox').checkbox();
        $('.dropdown').dropdown();
        return $('.popupField').popup({
            on: 'click',
            position: 'bottom center',
        });
    }
    pingCheck() {
        const self = this;
        this.doingCommand = true;
        this.pingCheckLoading(true);
        this.QTGateRegions().forEach(function (n) {
            if (!n.available())
                return;
            return n.ping(-1);
        });
        return socketIo.emit11('pingCheck', function (err, CallBack) {
            self.pingCheckLoading(false);
            if (CallBack === -1) {
                self.QTGateRegions().forEach(function (n) {
                    n.ping(-2);
                });
                return self.pingError(true);
            }
            return self.QTGateRegions.sort(function (a, b) {
                const _a = a.ping();
                const _b = b.ping();
                if (a.available() === b.available()) {
                    if (!a.available())
                        return 0;
                    if (_b > 0 && _a > _b)
                        return 1;
                    return -1;
                }
                if (b.available() && !a.available()) {
                    return 1;
                }
                return -1;
            });
        });
    }
    account() {
        this.showCards(false);
        let uu = null;
        const self = this;
        return this.CoGateAccount(uu = new CoGateAccount(self.QTTransferData(), function () {
            self.showCards(true);
            return self.CoGateAccount(uu = null);
        }));
    }
}
const planArray = [
    {
        name: 'free',
        showName: ['免费用户', '無料ユーザー', 'FREE USER', '免費用戶'],
        monthlyPay: '0',
        annually: '0',
        annuallyMonth: '0',
        next: 'p1',
        share: 0,
        internet: 0,
        tail: ko.observable(false),
        multi_gateway: 0,
        showNote: false,
        showButton: ko.observable(false),
        features: [{
                title: ['代理区域', 'エリア', 'Region', '代理區域'],
                detail: ['巴黎', 'パリ', 'Paris', '巴黎'],
            }, {
                title: ['服务器', 'サーバー', 'Server', '伺服器'],
                detail: ['共享', '共有', 'Share', '共享'],
            }, {
                title: ['月流量限制', '月データ制限', 'Bandwidth', '月流量限制'],
                detail: ['无限制', '無制限', 'Unlimited', '無限制'],
            }, {
                title: ['多代理', 'マルチプロクシ', 'Multi-Gateway', '多代理'],
                detail: ['1', '1', '1', '1'],
            }]
    }, {
        name: 'p1',
        showName: ['普通用户', '普通ユーザー', 'NORMAL USER', '普通用戶'],
        monthlyPay: '5.88',
        annually: '59.88',
        annuallyMonth: '4.99',
        next: 'p2',
        share: 0,
        internet: 0,
        tail: ko.observable(false),
        multi_gateway: 0,
        showNote: false,
        showButton: ko.observable(false),
        features: [{
                title: ['代理区域', 'エリア', 'Region', '代理區域'],
                detail: ['全球16区域', 'グローバル16区域', '16 regions worldwide ', '全球16區域'],
            }, {
                title: ['服务器', 'サーバー', 'Server', '伺服器'],
                detail: ['共享', '共有', 'Share', '共享'],
            }, {
                title: ['月流量限制', '月データ制限', 'Bandwidth', '月流量限制'],
                detail: ['无限制', '無制限', 'Unlimited', '無限制'],
            }, {
                title: ['多代理', 'マルチプロクシ', 'Multi-Gateway', '多代理'],
                detail: ['2', '2', '2', '2'],
            }]
    }, {
        name: 'p2',
        showName: ['超级用户', 'スーパーユーザー', 'POWER USER', '超級用戶'],
        monthlyPay: '19.88',
        annually: '199.99',
        annuallyMonth: '16.67',
        share: 0,
        internet: 0,
        multi_gateway: 0,
        showNote: false,
        tail: ko.observable(false),
        showButton: ko.observable(false),
        features: [{
                title: ['代理区域', 'エリア', 'Region', '代理區域'],
                detail: ['全球16区域', 'グローバル16区域', '16 regions worldwide ', '全球16區域'],
            }, {
                title: ['服务器', 'サーバー', 'Server', '伺服器'],
                detail: ['独占', '独占', 'Dedicated', '獨占'],
            }, {
                title: ['月流量限制', '月データ制限', 'Bandwidth', '月流量限制'],
                detail: ['无限制', '無制限', 'Unlimited', '無限制'],
            }, {
                title: ['多代理', 'マルチプロクシ', 'Multi-Gateway', '多代理'],
                detail: ['4', '4', '4', '4'],
            }]
    }
];
class planUpgrade {
    constructor(planNumber, isAnnual, promo, promoPrice, dataTransfer, exit) {
        this.planNumber = planNumber;
        this.isAnnual = isAnnual;
        this.promo = promo;
        this.promoPrice = promoPrice;
        this.dataTransfer = dataTransfer;
        this.plan = planArray[this.planNumber];
        this.showNote = ko.observable(false);
        this.detailArea = ko.observable(true);
        this.annually = this.promo ? Math.round(this.promoPrice * this.plan.annually * 100) / 100 : this.plan.annually;
        this.annuallyMonth = Math.round(this.annually * 100 / 12) / 100;
        this.monthlyPay = this.plan.monthlyPay;
        this.showCancel = ko.observable(false);
        this.showCurrentPlanBalance = null;
        this.cardNumberFolder_Error = ko.observable(false);
        this.cvcNumber_Error = ko.observable(false);
        this.postcode_Error = ko.observable(false);
        this.cardPayment_Error = ko.observable(false);
        this.paymentDataFormat_Error = ko.observable(false);
        this.paymentCardFailed = ko.observable(false);
        this.showStripeError = ko.observable(false);
        this.payment = ko.observable(0);
        this.paymentAnnually = ko.observable(false);
        this.doingPayment = ko.observable(false);
        this.paymentSelect = ko.observable(false);
        this.doingProcessBarTime = null;
        this.showCancelSuccess = ko.observable(false);
        this.showSuccessPayment = ko.observable(false);
        this.cardExpirationYearFolder_Error = ko.observable(false);
        this.cancel_Amount = ko.observable(0);
        const self = this;
        if (planNumber === 2) {
            this.showNote(true);
        }
        this.showCurrentPlanBalance = ko.computed(function () {
            if (/free/i.test(dataTransfer.productionPackage)) {
                return null;
            }
            return getCurrentPlanUpgradelBalance(dataTransfer.expire, dataTransfer.productionPackage, dataTransfer.isAnnual);
        });
        this.totalAmount = ko.computed(function () {
            const amount = (Math.round((self.payment() - self.showCurrentPlanBalance()) * 100) / 100).toString();
            if (!/\./.test(amount)) {
                return amount + '.00';
            }
            return amount;
        });
    }
    clearPaymentError() {
        this.cardNumberFolder_Error(false);
        this.cvcNumber_Error(false);
        this.postcode_Error(false);
        this.cardPayment_Error(false);
        this.paymentDataFormat_Error(false);
        return this.paymentCardFailed(false);
    }
    showPayment(payment, annually) {
        this.detailArea(false);
        this.payment(payment);
        this.paymentAnnually(annually);
    }
    showWaitPaymentFinished() {
        this.doingPayment(true);
        this.paymentSelect(false);
        this.clearPaymentError();
        $('.paymentProcess').progress('reset');
        let percent = 0;
        const doingProcessBar = () => {
            clearTimeout(this.doingProcessBarTime);
            this.doingProcessBarTime = setTimeout(() => {
                $('.paymentProcess').progress({
                    percent: ++percent
                });
                if (percent < 100)
                    return doingProcessBar();
            }, 1000);
        };
        return doingProcessBar();
    }
    stopShowWaitPaymentFinished() {
        this.doingPayment(false);
        clearTimeout(this.doingProcessBarTime);
        return $('.paymentProcess').progress('reset');
    }
    showBrokenHeart() {
        return $('.ui.basic.modal').modal('setting', 'closable', false).modal('show');
    }
    paymentCallBackFromQTGate(err, data) {
        this.stopShowWaitPaymentFinished();
        if (err) {
            return this.showBrokenHeart();
        }
        if (data.error === -1) {
            this.paymentSelect(false);
            data.command === 'cancelPlan' ? this.showCancelSuccess(true) : this.showSuccessPayment(true);
            if (data.command === 'cancelPlan' && data.Args[1]) {
                this.cancel_Amount(data.Args[1]);
            }
            const dataTrans = data.Args[0];
            return;
        }
        const errMessage = data.Args[0];
        if (data.error === 0) {
            this.paymentSelect(true);
            return this.paymentDataFormat_Error(true);
        }
        if (/expiration/i.test(errMessage)) {
            return this.cardExpirationYearFolder_Error(true);
        }
        if (/cvc/i.test(errMessage)) {
            return this.cvcNumber_Error(true);
        }
        if (/card number/i.test(errMessage)) {
            return this.cardNumberFolder_Error(true);
        }
        if (/format/i.test(errMessage)) {
            return this.cardPayment_Error(true);
        }
        if (/postcode/.test(errMessage)) {
            return this.postcode_Error(true);
        }
        this.paymentSelect(true);
        return this.paymentCardFailed(true);
    }
    openStripeCard() {
        this.clearPaymentError();
        let handler = null;
        const amount = Math.round((this.payment() - this.showCurrentPlanBalance()) * 100);
        if (StripeCheckout && typeof StripeCheckout.configure === 'function') {
            handler = StripeCheckout.configure({
                key: Stripe_publicKey,
                image: 'images/512x512.png',
                email: this.dataTransfer.account,
                zipCode: true,
                locale: _view.tLang() === 'tw' ? 'zh' : _view.tLang(),
                token: token => {
                    const payment = {
                        tokenID: token.id,
                        Amount: amount,
                        plan: this.plan.name,
                        isAnnual: this.paymentAnnually(),
                        autoRenew: true
                    };
                    this.showWaitPaymentFinished();
                    return socketIo.emit('cardToken', payment, (err, data) => {
                        return this.paymentCallBackFromQTGate(err, data);
                    });
                }
            });
            handler.open({
                name: 'CoNET Technology Inc',
                description: `${this.plan.name} `,
                amount: amount
            });
            return window.addEventListener('popstate', () => {
                handler.close();
            });
        }
        if (!this.showStripeError()) {
            this.showStripeError(true);
            $('.showStripeErrorIconConnect').popup({
                position: 'top center'
            });
            return $('.showStripeErrorIcon').transition('flash');
        }
    }
}
const findCurrentPlan = function (planName) {
    return planArray.findIndex(function (n) {
        return n.name === planName;
    });
};
class CoGateAccount {
    constructor(dataTransfer, exit) {
        this.dataTransfer = dataTransfer;
        this.exit = exit;
        this.username = this.dataTransfer.account;
        this.productionPackage = this.dataTransfer.productionPackage;
        this.promo = this.dataTransfer.promo;
        this.proPrice = this.dataTransfer.promoPrice;
        this.currentPlan = findCurrentPlan(this.productionPackage);
        this.freeAccount = ko.observable(/^free$/i.test(this.dataTransfer.productionPackage));
        this.planArray = ko.observableArray(planArray);
        this.planUpgrade = ko.observable(null);
        this.promoButton = ko.observable(false);
        this.promoInput = ko.observable('');
        this.promoInputError = ko.observable(false);
        this.doingPayment = ko.observable(false);
        this.paymentCardFailed = ko.observable(false);
        this.doingProcessBarTime = null;
        this.paymentSelect = ko.observable(false);
        this.inputFocus = ko.observable(true);
        this.showCancelSuccess = ko.observable(false);
        this.showSuccessPayment = ko.observable(false);
        this.UserPermentShapeDetail = ko.observable(false);
        this.paymentDataFormat_Error = ko.observable(false);
        this.cardExpirationYearFolder_Error = ko.observable(false);
        this.cvcNumber_Error = ko.observable(false);
        this.cardNumberFolder_Error = ko.observable(false);
        this.cardPayment_Error = ko.observable(false);
        this.postcode_Error = ko.observable(false);
        this.cancel_Amount = ko.observable(0);
        this.planArray()[this.currentPlan === 0 ? 1 : this.currentPlan].tail(true);
        for (let i = this.currentPlan + 1; i < planArray.length; i++) {
            this.planArray()[i].showButton(true);
        }
    }
    stopShowWaitPaymentFinished() {
        this.doingPayment(false);
        clearTimeout(this.doingProcessBarTime);
        return $('.paymentProcess').progress('reset');
    }
    paymentCallBackFromQTGate(err, data) {
        this.stopShowWaitPaymentFinished();
        if (err) {
            return; //this.showBrokenHeart()
        }
        if (data.error === -1) {
            this.paymentSelect(false);
            data.command === 'cancelPlan' ? this.showCancelSuccess(true) : this.showSuccessPayment(true);
            if (data.command === 'cancelPlan' && data.Args[1]) {
                this.cancel_Amount(data.Args[1]);
            }
            const dataTrans = data.Args[0];
            return this.UserPermentShapeDetail(false);
        }
        const errMessage = data.Args[0];
        if (data.error === 0) {
            this.paymentSelect(true);
            return this.paymentDataFormat_Error(true);
        }
        if (/expiration/i.test(errMessage)) {
            return this.cardExpirationYearFolder_Error(true);
        }
        if (/cvc/i.test(errMessage)) {
            return this.cvcNumber_Error(true);
        }
        if (/card number/i.test(errMessage)) {
            return this.cardNumberFolder_Error(true);
        }
        if (/format/i.test(errMessage)) {
            return this.cardPayment_Error(true);
        }
        if (/postcode/.test(errMessage)) {
            return this.postcode_Error(true);
        }
        this.paymentSelect(true);
        return this.paymentCardFailed(true);
    }
    selectPlan1(n) {
        let uu = null;
        const self = this;
        this.planUpgrade(uu = new planUpgrade(n, this.dataTransfer.isAnnual, this.dataTransfer.promo, this.dataTransfer.promoPrice, this.dataTransfer, function (payment) {
            self.planUpgrade(uu = null);
        }));
    }
    promoButtonClick() {
        this.promoButton(true);
        this.inputFocus(true);
        return new Cleave('.promoCodeInput', {
            uppercase: true,
            delimiter: '-',
            blocks: [4, 4, 4, 4]
        });
    }
    clearPaymentError() {
        //this.cardNumberFolder_Error ( false )
        //this.cvcNumber_Error ( false )
        //this.postcode_Error ( false )
        //this.cardPayment_Error ( false )
        //this.paymentDataFormat_Error ( false )
        this.promoInputError(false);
        return this.paymentCardFailed(false);
    }
    promoApplication() {
        const self = this;
        if (this.promoInput().length < 19) {
            return this.promoInputError(true);
        }
        this.inputFocus(false);
        this.promoButton(false);
        this.showWaitPaymentFinished();
        return socketIo.emit11('promoCode', this.promoInput(), function (err, data) {
            return self.paymentCallBackFromQTGate(err, data);
        });
        return false;
    }
    showWaitPaymentFinished() {
        this.doingPayment(true);
        //this.paymentSelect ( false )
        this.clearPaymentError();
        $('.paymentProcess').progress('reset');
        let percent = 0;
        const self = this;
        const doingProcessBar = function () {
            clearTimeout(self.doingProcessBarTime);
            self.doingProcessBarTime = setTimeout(function () {
                $('.paymentProcess').progress({
                    percent: ++percent
                });
                if (percent < 100)
                    return doingProcessBar();
            }, 1000);
        };
        return doingProcessBar();
    }
}
