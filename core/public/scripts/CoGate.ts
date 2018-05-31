declare const Cleave

class coGateRegion {
	public QTConnectData = ko.observable ( null )
	public showRegionConnectProcessBar = ko.observable ( false )
	public showExtraContent = ko.observable ( true )
	public QTGateConnect1 = ko.observable ('1')
	public showQTGateConnectOption = ko.observable (false)
	public QTGateMultipleGateway = ko.observable ( 1 )
	public QTGateMultipleGatewayPool = ko.observableArray ([1,2,4])
	public isFreeUser = ko.observable ( /free/i.test( this.dataTransfer.productionPackage ))
	public QTGateGatewayPortError = ko.observable ( false )
	public requestPortNumber = ko.observable (80)
	public QTGateLocalProxyPort = ko.observable (3001)
	public localProxyPortError = ko.observable ( false )
	public QTGateConnect2 = ko.observable ( false )
	constructor ( public region: QTGateRegions, public dataTransfer: iTransferData, public exit: () => void ) {
		
	}
	public upgradeAccount () {

	}

	public QTGateGatewayConnectRequest () {

	}
}

class CoGateClass {
	public QTGateRegions = ko.observableArray ( _QTGateRegions )
	public reloading = ko.observable ( true )
	public CoGateregion: KnockoutObservable < coGateRegion > = ko.observable (null)
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
	}

	public CardClick ( index: number ) {
		const self = this
		const uu = this.QTGateRegions()[ index ]
		let uuu = null
		this.CoGateregion ( uuu = new coGateRegion ( uu, this.QTTransferData(), function () {
			self.CoGateregion ( uuu = null )
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
			title: ['月流量','月データ量','Bandwidth','月流量'],
			detail: ['无限','無限','Unlimited','無限'],
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
			title: ['月流量','月データ量','Bandwidth','月流量'],
			detail: ['无限','無限','Unlimited','無限'],
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
			title: ['月流量','月データ量','Bandwidth','月流量'],
			detail: ['无限','無限','Unlimited','無限'],
		},{
			title: ['多代理','マルチプロクシ','Multi-Gateway','多代理'],
			detail: ['4','4','4','4'],
		}]
    }
]

class planUpgrade {
	private plan = planArray[ this.planNumber ]
	constructor ( public planNumber: number , exit: ( payment ? ) => void ) {

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
		this.planUpgrade ( uu = new planUpgrade ( n, function ( payment ) {
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