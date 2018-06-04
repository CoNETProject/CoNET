declare const Cleave
declare const StripeCheckout
const Stripe_publicKey = 'pk_live_VwEPmqkSAjDyjdia7xn4rAK9'

class coGateRegion {
	public QTConnectData = ko.observable ( null )
	public QTGateConnect1 = ko.observable ('1')
	public showQTGateConnectOption = ko.observable (false)
	public QTGateMultipleGateway = ko.observable ( 1 )
	public QTGateMultipleGatewayPool = ko.observableArray ([1,2,4])
	public isFreeUser = ko.observable ( /free/i.test( this.dataTransfer.productionPackage ))
	public QTGateGatewayPortError = ko.observable ( false )
	public requestPortNumber = ko.observable ('80')
	public QTGateLocalProxyPort = ko.observable ('3001')
	public localProxyPortError = ko.observable ( false )
	public QTGateConnect2 = ko.observable ( false )
	public WebRTCleak = ko.observable ( true )
	private doingProcessBarTime = null
	public error = ko.observable ( -1 )
	public CoGateConnerting = ko.observable ( false )
	public disconnecting = ko.observable ( false )
	constructor ( public region: QTGateRegions, public dataTransfer: iTransferData, public account: ()=> void, public exit: () => void ) {
		const self = this

		socketIo.emit11 ( 'checkPort', '3001', ( err, nextPort ) => {
			if ( err ) {
				self.QTGateLocalProxyPort ( nextPort )
			}
			
		})

		this.requestPortNumber.subscribe ( function ( newValue: string ) {
			const uu = parseInt ( newValue )
			self.QTGateGatewayPortError ( false )
			if ( !newValue ) {
				return self.requestPortNumber ( '80')
			}
			if ( uu < 1 || uu > 65535 || uu === 22 ) {
				self.QTGateGatewayPortError ( true )
				return $( '.popupInput' ).popup ({
					on: 'focus',
					movePopup: false,
					position: 'top left',
					inline: true
				})
			}
		})

		this.QTGateLocalProxyPort.subscribe ( function ( newValue: string ) {
			const uu = parseInt ( newValue )
			self.localProxyPortError ( false )
			if ( !newValue ) {
				return self.requestPortNumber ( '3001' )
			}

			if ( uu < 3000 || uu > 65535 ) {
				self.localProxyPortError ( true )
				return $( '.popupInput' ).popup ({
					on: 'focus',
					movePopup: false,
					position: 'top left',
					inline: true
				})
			}

			return socketIo.emit11 ( 'checkPort', newValue, err => {
				return self.localProxyPortError ( err )
			})

		})
		
	}

	public upgradeAccount () {

	}

	public showQTGateConnectOptionClick () {
		this.showQTGateConnectOption ( !this.showQTGateConnectOption())
		
		if ( this.WebRTCleak()) {
			$('.checkboxWebRTC').checkbox ('set checked')
		} else {
			$('.checkboxWebRTC').checkbox ('set unchecked')
		}
	}

	public QTGateGatewayConnectRequestCallBack ( error, connectCommand: IConnectCommand[] ) {
		clearTimeout ( this.doingProcessBarTime )
		this.CoGateConnerting ( false )
		
		if ( typeof error ==='number' && error > -1 ) {
			
			//this.QTGateConnectRegionActive ( true )
			//this.QTGateGatewayActiveProcess ( false )
			this.error ( error )
			return 
		}
		const data1 = connectCommand[0]
		if ( data1 ) {
			//this.QTTransferData ( data1.transferData )
			return this.QTConnectData ( data1 )
		}
	}

	public QTGateGatewayConnectRequest () {
		const self = this
		const connect: IConnectCommand = {

			account: this.dataTransfer.account,
			imapData: null,
			gateWayIpAddress: null,
			region: this.region.qtRegion,
			connectType: this.QTGateConnect1() === '1' ? 2 : 1,
			localServerPort: this.QTGateLocalProxyPort(),
			AllDataToGateway: !this.QTGateConnect2 (),
			error: null,
			fingerprint: null,
			localServerIp: null,
			multipleGateway: [],
			requestPortNumber: this.requestPortNumber (),
			requestMultipleGateway: this.QTGateMultipleGateway(),
			webWrt: this.WebRTCleak ()
		}
		this.CoGateConnerting ( true )
		
		
		socketIo.emit11 ( 'QTGateGatewayConnectRequest', connect )
		
		return false
		
	}

	public showUserInfoMacOS () {
		
	}
	public disconnectClick () {
		socketIo.emit11 ( 'disconnectClick' )

		this.QTConnectData ( null )
		this.exit ()
		
	}
}

class CoGateClass {
	public QTGateRegions = ko.observableArray ( _QTGateRegions )
	public reloading = ko.observable ( true )
	public CoGateRegion: KnockoutObservable < coGateRegion > = ko.observable (null)
	public showCards = ko.observable ( true )
	public QTTransferData: KnockoutObservable < iTransferData > = ko.observable ( )
	public pingCheckLoading = ko.observable ( false )
	public pingError = ko.observable ( false )
	public doingCommand = false
	public freeAccount = ko.observable ( true )
	public CoGateAccount: KnockoutObservable < CoGateAccount > = ko.observable ( null )

	private getAvaliableRegionCallBack ( region: string [], dataTransfer: iTransferData, config: install_config ) {
		this.showCards ( true )
		this.QTGateRegions().forEach( function ( n ) {
			const index = region.findIndex ( function ( nn )  { return nn === n.qtRegion })
			if ( index < 0 )
				return n.available( false )
			return n.available ( true )
		})
		this.QTGateRegions.sort ( function ( a, b ) { 
			if ( a.available() === b.available() )  
				return 0
			if ( b.available() && !a.available() ) {
				return 1
			}
			return -1
		})
		this.reloading ( false )
		this.doingCommand = false
		dataTransfer.promo = dataTransfer.promo || ['对折促销月：选择年付费送一年服务','今月中プロモーション：50%オフ、一年払いと次年度フリー','Promotion 50% off:  Annual user will get next free year.','對折促銷月：選擇年付費送一年服務']
		dataTransfer.promoPrice = 0.5
		this.QTTransferData ( dataTransfer )
		this.freeAccount ( /^free$/i.test( dataTransfer.productionPackage ))
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
		$ ('.ui.dropdown').dropdown()
		/*
		this.QTTransferData ( dataTransfer )
		this.config ( config )
		this.showRegionData ( true )
		this.QTGateRegionInfo ( false )
		this.pingCheckLoading( false )
		return clearTimeout ( this.doingProcessBarTime )
		*/
	}

	private reloadRegion () {
		const self = this
		this.reloading ( true )
		this.doingCommand = true
		socketIo.emit11 ( 'getAvaliableRegion', function ( region: string [], dataTransfer: iTransferData, config: install_config ) {
			if ( region && region.length ) {
				return self.getAvaliableRegionCallBack ( region, dataTransfer, config )
			}
			
		})
	}

	private pingCheckReturn ( region: string, ping: number ) {
		const index = this.QTGateRegions().findIndex ( function ( n ) { return n.qtRegion === region })
            if ( index < 0 )
                return
            const _reg = this.QTGateRegions()[index]
            if ( !_reg.available )
                return
            _reg.ping ( ping )
            const fromIInputData = $(`#card-${ _reg.qtRegion.replace('.','-')}`)
            const uu = ping
            const _ping = Math.round((500 - ping)/100)

            fromIInputData.rating ({
                initialRating: _ping > 0 ? _ping : 0
            }).rating ('disable')
	}

	constructor () {
		const self = this
		this.reloadRegion ()

		socketIo.on ( 'pingCheck', function ( region: string, ping: number ) {
			return self.pingCheckReturn ( region, ping )
		})

		socketIo.on ( 'QTGateGatewayConnectRequest', function ( err, cmd: IConnectCommand[] ) {
			if ( ! self.CoGateRegion ) {
				let uuu: coGateRegion = null
				const region = cmd[0].region
				const regionIndex = self.QTGateRegions().findIndex ( function ( n ) {
					return n.qtRegion === region
				})
				const uu = self.QTGateRegions()[ regionIndex ]
				self.CoGateRegion ( uuu = new coGateRegion ( uu, self.QTTransferData(), function () {
					self.account ()
				}, function () {
					self.CoGateRegion ( uuu = null )
					return self.showCards ( true )
				}))
				
			}
			return self.CoGateRegion().QTGateGatewayConnectRequestCallBack ( err, cmd )
		})

		socketIo.on ( 'containerStop', function () {

		})
	}

	public CardClick ( index: number ) {
		const self = this
		const uu = this.QTGateRegions()[ index ]
		let uuu = null
		this.CoGateRegion ( uuu = new coGateRegion ( uu, this.QTTransferData(), function () {
			self.account ()
		}, function () {
			self.CoGateRegion ( uuu = null )
			return self.showCards ( true )
		}))
		this.showCards ( false )
		$('.ui.checkbox').checkbox ()
		$('.dropdown').dropdown()
		return $('.popupField').popup({
			on:'click',
			position: 'bottom center',
		})

	}

	public pingCheck () {
		const self = this
		this.doingCommand = true
		this.pingCheckLoading ( true )
		this.QTGateRegions().forEach ( function ( n ) {
			if ( ! n.available())
				return
			return n.ping ( -1 )
		})

		return socketIo.emit11 ( 'pingCheck', function ( err, CallBack ) {
			self.pingCheckLoading ( false )
			if ( CallBack === -1 ) {
				self.QTGateRegions().forEach ( function ( n ) {
					n.ping ( -2 )
				})
				return self.pingError ( true )
			}
			return self.QTGateRegions.sort ( function ( a, b ) {
				const _a = a.ping()
				const _b = b.ping()
				if ( a.available() === b.available()) {
					if ( !a.available ())
						return 0
					if ( _b > 0 && _a > _b )
						return 1
					return -1
				}  
					
				if ( b.available() && !a.available() ) {
					return 1
				}
				return -1
			})
			
		})
	}

	public account () {
		
		this.showCards ( false )
		let uu = null
		const self = this
		return this.CoGateAccount ( uu = new CoGateAccount ( self.QTTransferData (), function () {
			self.showCards ( true )
			return self.CoGateAccount ( uu = null )
		}))
		
	}

}

const planArray = [
    {
		name:'free',
		showName: ['免费用户','無料ユーザー','FREE USER','免費用戶'],
        monthlyPay: '0',
		annually: '0',
		annuallyMonth: '0',
        next:'p1',
        share: 0,
		internet: 0,
		tail: ko.observable ( false ),
        multi_gateway:0,
		showNote: false,
		showButton: ko.observable ( false ),
		features: [{
			title: ['代理区域','エリア','Region','代理區域'],
			detail: ['巴黎','パリ','Paris','巴黎'],
		},{
			title: ['服务器','サーバー','Server','伺服器'],
			detail: ['共享','共有','Share','共享'],
		},{
			title: ['月流量限制','月データ制限','Bandwidth','月流量限制'],
			detail: ['无限制','無制限','Unlimited','無限制'],
		},{
			title: ['多代理','マルチプロクシ','Multi-Gateway','多代理'],
			detail: ['1','1','1','1'],
		}]

    },{
		name:'p1',
		showName: ['普通用户','普通ユーザー','NORMAL USER','普通用戶'],
        monthlyPay: '5.88',
		annually: '59.88',
		annuallyMonth:'4.99',
        next:'p2',
        share: 0,
		internet: 0,
		tail: ko.observable ( false ),
        multi_gateway:0,
		showNote: false,
		showButton: ko.observable ( false ),
		features: [{
			title: ['代理区域','エリア','Region','代理區域'],
			detail: ['全球16区域','グローバル16区域','16 regions worldwide ','全球16區域'],
		},{
			title: ['服务器','サーバー','Server','伺服器'],
			detail: ['共享','共有','Share','共享'],
		},{
			title: ['月流量限制','月データ制限','Bandwidth','月流量限制'],
			detail: ['无限制','無制限','Unlimited','無限制'],
		},{
			title: ['多代理','マルチプロクシ','Multi-Gateway','多代理'],
			detail: ['2','2','2','2'],
		}]
    },{
		name:'p2',
		showName: ['超级用户','スーパーユーザー','POWER USER','超級用戶'],
        monthlyPay: '19.88',
		annually: '199.99',
		annuallyMonth: '16.67',
        share: 0,
        internet: 0,
        multi_gateway:0,
		showNote: false,
		tail: ko.observable ( false ),
		showButton: ko.observable ( false ),
		features: [{
			title: ['代理区域','エリア','Region','代理區域'],
			detail: ['全球16区域','グローバル16区域','16 regions worldwide ','全球16區域'],
		},{
			title: ['服务器','サーバー','Server','伺服器'],
			detail: ['独占','独占','Dedicated','獨占'],
		},{
			title: ['月流量限制','月データ制限','Bandwidth','月流量限制'],
			detail: ['无限制','無制限','Unlimited','無限制'],
		},{
			title: ['多代理','マルチプロクシ','Multi-Gateway','多代理'],
			detail: ['4','4','4','4'],
		}]
    }
]


class planUpgrade {
	private plan = planArray[ this.planNumber ]
	public showNote = ko.observable ( false )
	public detailArea = ko.observable ( true )
	public annually = this.promo ? Math.round ( this.promoPrice * this.plan.annually * 100 )/100 : this.plan.annually
	public annuallyMonth = Math.round ( this.annually * 100 / 12 ) / 100
	public monthlyPay = this.plan.monthlyPay
	public showCancel = ko.observable ( false )
	public showCurrentPlanBalance = null
	public cardNumberFolder_Error = ko.observable ( false )
	public cvcNumber_Error = ko.observable ( false )
	public postcode_Error = ko.observable ( false )
	public cardPayment_Error = ko.observable ( false )
	public paymentDataFormat_Error = ko.observable ( false )
	public paymentCardFailed = ko.observable ( false )
	public showStripeError = ko.observable ( false )
	public payment = ko.observable (0)
	public paymentAnnually = ko.observable ( false )
	public doingPayment = ko.observable ( false )
	public paymentSelect = ko.observable ( false )
	private doingProcessBarTime = null
	public showCancelSuccess = ko.observable ( false )
	public showSuccessPayment = ko.observable ( false )
	public cardExpirationYearFolder_Error = ko.observable ( false )
	public cancel_Amount = ko.observable (0)

	private clearPaymentError () {
		this.cardNumberFolder_Error ( false )
		this.cvcNumber_Error ( false )
		this.postcode_Error ( false )
		this.cardPayment_Error ( false )
		this.paymentDataFormat_Error ( false )
		return this.paymentCardFailed ( false )

	}

	constructor ( public planNumber: number, public isAnnual: boolean,  public promo: string[], public promoPrice, private dataTransfer: iTransferData, exit: ( payment ? ) => void ) {
		const self = this
		if ( planNumber === 2 ) {
			this.showNote ( true )
		}
		this.showCurrentPlanBalance = ko.computed (function (){
			if ( /free/i.test (dataTransfer.productionPackage )) {
				return null
			}
			return getCurrentPlanUpgradelBalance ( dataTransfer.expire, dataTransfer.productionPackage, dataTransfer.isAnnual )

		})
		this.totalAmount = ko.computed ( function () {
			const amount = ( Math.round (( self.payment() - self.showCurrentPlanBalance()) * 100 ) / 100 ).toString ()
            if ( !/\./.test( amount )) {
                return amount + '.00'
            }
            return amount
		})
	}
	public showPayment ( payment: number, annually: boolean ) {
		this.detailArea ( false )
		this.payment ( payment )
		this.paymentAnnually ( annually )
	}

	private showWaitPaymentFinished () {

		this.doingPayment ( true )
		this.paymentSelect ( false )
		this.clearPaymentError ()
		$('.paymentProcess').progress ('reset')
		let percent = 0
		const doingProcessBar = () => {
			clearTimeout ( this.doingProcessBarTime )
			this.doingProcessBarTime = setTimeout (() => {
				$('.paymentProcess').progress ({
					percent: ++ percent
				})
				if ( percent < 100 )
					return doingProcessBar ()
			}, 1000 )
		}
		return doingProcessBar ()
	}

	private stopShowWaitPaymentFinished () {
		this.doingPayment ( false  )
		clearTimeout ( this.doingProcessBarTime )
		return $('.paymentProcess').progress ('reset')
	}

	public showBrokenHeart () {
		return $( '.ui.basic.modal').modal ('setting', 'closable', false ).modal ( 'show' )
	}

	private paymentCallBackFromQTGate ( err, data: QTGateAPIRequestCommand ) {
		this.stopShowWaitPaymentFinished ()
			if ( err ) {
				return this.showBrokenHeart()
			}
			if ( data.error === -1 ) {
				this.paymentSelect ( false )
				data.command === 'cancelPlan' ? this.showCancelSuccess ( true ) : this.showSuccessPayment ( true )
				if ( data.command === 'cancelPlan' && data.Args[1]) {
					this.cancel_Amount ( data.Args[1])
				}
				
				const dataTrans: iTransferData = data.Args[0]

				
				
				return 
			}
			
			const errMessage = data.Args[0]
			if ( data.error === 0 ) {
				this.paymentSelect ( true )
				return this.paymentDataFormat_Error ( true )
			}
				
			if ( /expiration/i.test ( errMessage )) {
				return this.cardExpirationYearFolder_Error ( true )
			}

			if ( /cvc/i.test ( errMessage )) {
				return this.cvcNumber_Error ( true )
			}

			if ( /card number/i.test ( errMessage )) {
				return this.cardNumberFolder_Error ( true )
			}

			if ( /format/i.test ( errMessage )) {
				return this.cardPayment_Error ( true )
			}

			if ( /postcode/.test (errMessage)) {
				return this.postcode_Error ( true )
			}

			this.paymentSelect ( true )
			return this.paymentCardFailed ( true )
	}

	public openStripeCard () {
		this.clearPaymentError ()
		let handler = null
		const amount = Math.round (( this.payment() - this.showCurrentPlanBalance()) * 100 )
		if ( StripeCheckout && typeof StripeCheckout.configure === 'function' ){
			handler = StripeCheckout.configure ({
				key: Stripe_publicKey,
				image: 'images/512x512.png',
				email: this.dataTransfer.account,
				zipCode: true,
				locale: _view.tLang() === 'tw' ? 'zh': _view.tLang(),
				token: token => {
					
					const payment: iQTGatePayment = {
						tokenID: token.id,
						Amount: amount,
						plan: this.plan.name,
						isAnnual: this.paymentAnnually (),
						autoRenew: true
						
					}
					this.showWaitPaymentFinished () 
					return socketIo.emit ( 'cardToken', payment, ( err, data: QTGateAPIRequestCommand ) => {
						return this.paymentCallBackFromQTGate ( err, data )
					})
				}
			})
			handler.open ({
				name: 'CoNET Technology Inc',
				description: `${ this.plan.name } `,
				amount: amount
			})

			return window.addEventListener( 'popstate', () => {
				handler.close()
			})
			
		}
		if ( !this.showStripeError ()) {
			this.showStripeError ( true )
			$('.showStripeErrorIconConnect').popup ({
				position: 'top center'
			})
			return $('.showStripeErrorIcon').transition ('flash')
		}
		

	}
	
}

const findCurrentPlan = function ( planName: string ) {
	return planArray.findIndex ( function ( n ) {
		return n.name === planName
	})
}

class CoGateAccount {
	public username = this.dataTransfer.account
	public productionPackage = this.dataTransfer.productionPackage
	public promo = this.dataTransfer.promo
	public proPrice = this.dataTransfer.promoPrice
	public currentPlan = findCurrentPlan ( this.productionPackage )
	public freeAccount = ko.observable ( /^free$/i.test(this.dataTransfer.productionPackage ))
	public planArray = ko.observableArray ( planArray )
	public planUpgrade: KnockoutObservable < planUpgrade > = ko.observable ( null )
	public promoButton = ko.observable ( false )
	public promoInput = ko.observable ('')
	public promoInputError = ko.observable ( false )
	public doingPayment = ko.observable ( false )
	public paymentCardFailed = ko.observable ( false )
	private doingProcessBarTime = null
	public paymentSelect = ko.observable ( false )
	public inputFocus = ko.observable ( true )
	public showCancelSuccess = ko.observable ( false )
	public showSuccessPayment = ko.observable ( false )
	public UserPermentShapeDetail = ko.observable ( false )
	public paymentDataFormat_Error = ko.observable ( false )
	public cardExpirationYearFolder_Error = ko.observable ( false )
	public cvcNumber_Error = ko.observable ( false )
	public cardNumberFolder_Error = ko.observable ( false )
	public cardPayment_Error = ko.observable ( false )
	public postcode_Error = ko.observable ( false )
	public cancel_Amount = ko.observable ( 0 )

	private stopShowWaitPaymentFinished () {
		this.doingPayment ( false  )
		clearTimeout ( this.doingProcessBarTime )
		return $('.paymentProcess').progress ('reset')
	}

	private paymentCallBackFromQTGate ( err, data: QTGateAPIRequestCommand ) {
		
		this.stopShowWaitPaymentFinished ()
		if ( err ) {
			return //this.showBrokenHeart()
		}
		if ( data.error === -1 ) {
			this.paymentSelect ( false )
			data.command === 'cancelPlan' ? this.showCancelSuccess ( true ) : this.showSuccessPayment ( true )
			if ( data.command === 'cancelPlan' && data.Args[1]) {
				this.cancel_Amount ( data.Args[1])
			}
			
			const dataTrans: iTransferData = data.Args[0]

			
			
			return this.UserPermentShapeDetail ( false )
		}
		
		const errMessage = data.Args[0]
		if ( data.error === 0 ) {
			this.paymentSelect ( true )
			return this.paymentDataFormat_Error ( true )
		}
			
		if ( /expiration/i.test ( errMessage )) {
			return this.cardExpirationYearFolder_Error ( true )
		}

		if ( /cvc/i.test ( errMessage )) {
			return this.cvcNumber_Error ( true )
		}

		if ( /card number/i.test ( errMessage )) {
			return this.cardNumberFolder_Error ( true )
		}

		if ( /format/i.test ( errMessage )) {
			return this.cardPayment_Error ( true )
		}

		if ( /postcode/.test (errMessage)) {
			return this.postcode_Error ( true )
		}

		this.paymentSelect ( true )
		return this.paymentCardFailed ( true )
	}
	
	constructor ( private dataTransfer: iTransferData, public exit: () => void ) {

		this.planArray()[ this.currentPlan === 0 ? 1 : this.currentPlan ].tail ( true )
		for ( let i = this.currentPlan + 1; i < planArray.length; i ++ ) {
			this.planArray()[i].showButton ( true )
		}
	}

	public selectPlan1 ( n: number ) {
		let uu = null
		const self = this
		this.planUpgrade ( uu = new planUpgrade ( n, this.dataTransfer.isAnnual, this.dataTransfer.promo, this.dataTransfer.promoPrice, this.dataTransfer, function ( payment ) {
			self.planUpgrade ( uu = null )
		}))

	}

	public promoButtonClick () {
		this.promoButton ( true )
		this.inputFocus ( true )
		return new Cleave ( '.promoCodeInput', {
			uppercase: true,
			delimiter: '-',
			blocks: [4, 4, 4, 4]
		})
	}

	private clearPaymentError () {
		//this.cardNumberFolder_Error ( false )
		//this.cvcNumber_Error ( false )
		//this.postcode_Error ( false )
		//this.cardPayment_Error ( false )
		//this.paymentDataFormat_Error ( false )
		this.promoInputError ( false )
		return this.paymentCardFailed ( false )
	}

	public promoApplication () {
		const self = this
		if ( this.promoInput().length < 19 ) {
			return this.promoInputError ( true )
		}
		this.inputFocus ( false )
		this.promoButton ( false )
		this.showWaitPaymentFinished ()
		
		
		return socketIo.emit11 ( 'promoCode', this.promoInput(), function ( err, data: QTGateAPIRequestCommand ) {
			return self.paymentCallBackFromQTGate ( err, data )
			
		})
		
		return false
	}

	private showWaitPaymentFinished () {

		this.doingPayment ( true )
		//this.paymentSelect ( false )
		this.clearPaymentError ()
		$('.paymentProcess').progress ('reset')
		let percent = 0
		const self = this
		const doingProcessBar = function () {
			clearTimeout ( self.doingProcessBarTime )
			self.doingProcessBarTime = setTimeout ( function () {
				$('.paymentProcess').progress ({
					percent: ++ percent
				})
				if ( percent < 100 )
					return doingProcessBar ()
			}, 1000 )
		}
		return doingProcessBar ()
	}
	
}