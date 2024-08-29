import { APP_PROJECT_NAME, APP_COMPANY_NAME } from '@/config'
import { View, Text, Image } from '@tarojs/components'
import sdkImg from '../imgs/sdk.png'
import './index.scss'

const hostname = 'https://www.yimaitongdao.com'
const projectName = APP_PROJECT_NAME
const companyName = APP_COMPANY_NAME
const Protocol = () => {
  return (
    <View className="my-protocol__boby" >
      <View className="my-protocol__section">更新时间：   2021年 12 月 09 日</View>
      <View className="my-protocol__section">生效时间：   2021 年 12月 15 日</View>
      <View className="my-protocol__section">
        欢迎您使用{projectName}（以下简称“本平台”或“我们”）的产品和服务。您在访问本平台、使用本平台的产品或服务时，我们可能会收集和使用您的相关信息。
        我们知道任何用户的个人信息安全都是至关重要的，我们将高度重视并竭力保护好您的个人信息隐私的安全。
        本平台的《用户隐私政策》（以下简称“本政策”）适用于您对{projectName}平台的访问以及对本平台所提供的全部产品或服务的使用而提供或留存的信息。
        <Text className="my-protocol--strong">
          我们希望通过本政策向您说明我们在您访问本平台、使用本平台的产品和服务时是如何收集、使用、保存、共享和转让这些信息的，以及我们将为您提供查询、更新、删除、保护以及注销这些信息的方式。
        </Text>
      </View>
      <View className="my-protocol__section">本隐私政策将帮助您了解以下内容</View>
      <View className="my-protocol__section">一、如何收集和使用您的个人信息</View>
      <View className="my-protocol__section">二、如何使用Cookie和其他追踪技术</View>
      <View className="my-protocol__section">三、如何共享、转让、公开披露您的个人信息</View>
      <View className="my-protocol__section">四、如何存储和保护您的个人信息</View>
      <View className="my-protocol__section">五、您的权力</View>
      <View className="my-protocol__section">六、如何处理未成年人的个人信息</View>
      <View className="my-protocol__section">七、本隐私政策的修订及更新</View>
      <View className="my-protocol__section">八、如何联系我们</View>
      <View className="my-protocol__section">九、隐私政策的适用范围及法律</View>
      <View className="my-protocol__section">十、定义</View>
      <View className="my-protocol__section">
        <Text className="my-protocol--strong">
          医脉同道微信小程序、医脉同道网站、医脉同道快应用由科锐数字科技（苏州）有限公司（以下简称“科锐 数字”）（注册地址：苏州工业园区星湖街328号创意产业园10-8F-1单元，联系方式：0512-62963318）及其关联公司运营。关联公司详见附件一《科锐数字科技（苏州）有限公司关联公司明细》，涉及具体产品服务的，将由有资质的服务商提供。
        </Text>
        如果您在本网站、科锐数字关联公司网站或其他由科锐数字提供的移动应用或软件上（以下简称“医脉同道”），访问、预订或使用医脉同道的产品与/或服务（以下统称为“服务”），便视为用户接受了以下隐私政策，请您仔细阅读以下内容，尤其是以下加粗字体。如果您不同意以下任何内容，请立刻停止访问/使用本网站或其他任何移动应用或软件。本隐私政策中提及的“医脉同道”以及“我们”均指医脉同道，“用户”以及“您”均指自愿接受本隐私政策的用户。
      </View>
      <View className="my-protocol__title">一、如何收集和使用您的个人信息</View>
      <View className="my-protocol__section">
        <View>1、基本功能及相关必要个人信息</View>
        <View>在您使用本平台提供的以下服务或功能过程中，我们将基于以下基本功能收集您的相关必要个人信息。</View>
      </View>
      <View className="my-protocol__section">1.1求职用户</View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">a) 注册、登录</View>
        <View>您在使用医脉同道提供的服务时，首先需要成为医脉同道的注册用户。当您注册时，您需要向我们提供您的本人手机号码，我们将通过发送短信验证码的形式来验证您的手机号码是否有效。如果您不提供该信息，将不能完成注册，从而会影响您的简历上传。</View>
        <View>如您拒绝提供手机号码进行实名验证，将导致注册不成功，您可以退出注册页面后进入医脉同道平台，仅浏览平台内的相关信息内容，但不可进行任何其它的操作或接受相应服务。</View>
      </View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">b) 完善在线简历：</View>
        <View>对于求职者，在您注册成功后，您需要完善在线简历（公开），设置头像，
          <Text className="my-protocol--strong">如实填写您的姓名、性别、职场人身份、生日、工作经历（工作起始时间、公司名称、工作岗位、工作内容描述及项目经历等）、教育经历（毕业院校、专业、学历、在校时间、在校经历等）、资格证书、志愿者服务经历、以及工作期望（期望城市、薪资、行业、岗位等）。</Text>
          本平台将会根据您提供的以上信息，为您匹配可能适合您的岗位。</View>
      </View>
      <View className="my-protocol__section">
        1.2 招聘用户
      </View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">a) 账号注册：</View>
        <View>您在使用医脉同道提供的服务时，首先需要成为医脉同道的注册用户。当您注册时，您需要向我们提供<Text className="my-protocol--strong">手机号码、公司名称</Text>。我们将通过发送短信验证码的形式来验证您的手机号码是否有效。如果您不提供该信息，将不能完成注册，从而会影响您的职位发布。</View>
      </View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">b) 招聘者身份认证：</View>
        <View>您在使用医脉同道提供的服务时，需要通过实名认证和企业认证。
          <Text className="my-protocol--strong">您需要向本平台提供您的身份信息用于身份核验，包括您的真实姓名、您的公司全称、公司营业执照、邮箱、您的职位头衔以及您的在职证明，以证明您可以代表该单位进行招聘，保证招聘的真实性，维护求职者的合法权益。</Text>
          通过验证后，随即您可以在本平台发布职位，开始招聘工作。</View>
      </View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">c) 职位发布：</View>
        <View>企业用户账号认证通过并建立合作关系后可以在医脉同道平台发布招聘信息与岗位信息，为此平台将收集职位信息包括：<Text className="my-protocol--strong">职位名称、性质、描述、工作地点、学历/工作年限</Text>等要求。</View>
      </View>
      <View className="my-protocol__section">
        2、附加功能及相关必要个人信息
      </View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">a) 投递简历</View>
        <View>对于求职者，在进行简历投递前，您需要先创建简历，医脉同道会收集您的<Text className="my-protocol--strong">简历信息</Text>，以便将其通过平台传递至招聘者或通过邮箱发送至招聘企业邮箱。</View>
      </View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">b) 与位置有关的服务</View>
        <View>在<Text className="my-protocol--strong">推荐职位、搜索职位、订阅职位、编辑简历</Text>场景中，我们会收集您的位置信息，以更好地为您提供求职、招聘功能以及与位置有关的产品或服务。我们在首次会通过弹窗申请获取您的位置信息（GPS定位）；经您授权同意后，再获取您的位置权限，例如您所在的城市、地区。我们承诺仅会在您主动使用相关功能时获取您的位置信息，仅按照提供相关服务所需的最低频率收集您的位置信息，不会追踪您的行踪轨迹。如果拒绝授权，您可以    选择手动输入目标求职地点或使用不需要位置信息的招聘或求职功能，但不影响您使用不基于位置的其他服务。</View>
      </View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">c) 个性化推荐服务：</View>
        <View>您可以用过{projectName}平台进行关键词搜索。同时，我们会<Text className="my-protocol--strong">基于您提交的求职意向或招聘意向（若您是求职者，您填写的在线简历中，例如求职期望、工作经历等；若您是招聘者，您填写的职位发布信息）为您推荐、展示您可能感兴趣的或与您较为匹配的职位、求职者或其他平台产品或服务。</Text></View>
      </View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">d) 在线支付：</View>
        <View>在您选择在线支付购买我们的畅聊卡、VIP账号、职位发布数、以及职位刷新等增值服务时，您可以选择第三方支付机构所提供的支付服务。支付功能中，我们不收集您的个人信息，但是我们需要将您的<Text className="my-protocol--strong">购买明细、订单号与交易金额等信息</Text>与第三方支付机构共享以便于对方确认您的支付指令并完成支付。</View>
      </View>
      <View className="my-protocol__li">
        <View className="my-protocol--strong">e) 在线沟通：</View>
        <View>当您使用医脉同道与求职者/招聘者进行线上沟通时，可以和对方交换电话号码。根据沟通情况，您可自行决定是否交换<Text className="my-protocol--strong">在线简历或其他信息。</Text></View>
      </View>
      <View className="my-protocol__section">
        <View>3、需要您授权同意调取系统权限的情形</View>
        <View>基于保护招聘求职过程中的求职者人身安全之考虑，以及满足互联网平台服务普遍存在的风控需求，{projectName}的附加业务功能可能需要您事先同意我们调取相关的系统权限以收集和使用您的个人信息。</View>
      </View>
      <View className="my-protocol__section">
        4、通过第三方SDK收集信息的情形
      </View>
      <View className="my-protocol__li">
        a) 为了保障本平台的稳定运行、功能实现，使您能够使用和体验更丰富的服务及功能，我们的应用中会嵌入授权合作伙伴的SDK或其他类似的应用程序。我们会对第三方获取个人信息的SDK进行严格的安全监测，以保护您的信息安全。医脉同道接入的第三方软件开发包（SDK）列表：
        <View>
          <Image className="my-protocol__image" mode="aspectFit" src={sdkImg} />
        </View>
      </View>
      <View className="my-protocol__li">
        b) 我们会对前述应用程序接口（API）、软件工具开发包（SDK）及授权合作伙伴进行严格的安全检测，并约定严格的数据保护措施，令其按照本政策及其他任何相关的保密和安全措施来处理个人信息；
      </View>
      <View className="my-protocol__li">
        c) 此外，当您通过本平台接入第三方服务时，您的信息将使用该第三方的隐私政策，建议您在接受相关服务前阅读并确认理解相关协议；
      </View>
      <View className="my-protocol__li">
        d) 对我们与之共享用户信息的公司、组织和个人，我们将会与其签署严格的保密协议以及信息保护约定，要求他们按照我们的说明、本政策以及其他任何相关的保密和安全措施来处理用户信息。
      </View>
      <View className="my-protocol__section">
        5、需要您授权的其他情形
      </View>
      <View className="my-protocol__li">
        a) 我们可能会将来自某项服务的信息与来自其他服务所获得的信息结合起来，用于为您提供更加精准化、个性化的服务使用；
      </View>
      <View className="my-protocol__li">
        b) 邀请您参与有关我们产品、服务的调查，以改进我们平台的服务效果；
      </View>
      <View className="my-protocol__li">
        c) 经您同意或授权的或法律法规允许的其他用途。
      </View>
      <View className="my-protocol__section">
        <View>6、征得授权同意的例外</View>
        <View>根据相关法律法规的规定，在以下情形中，我们可以在不征得您的授权同意的情况下收集、使用一些必要的个人信息：</View>
      </View>
      <View className="my-protocol__li">
        a) 为订立、履行个人作为一方当事人的合同所必需；
      </View>
      <View className="my-protocol__li">
        b) 为履行法定职责或者法定义务所必需；
      </View>
      <View className="my-protocol__li">
        c) 为应对突发公共卫生事件，或者紧急情况下为保护自然人的生命健康和财产安全所必需；
      </View>
      <View className="my-protocol__li">
        d) 为公共利益实施新闻报道、舆论监督等行为，在合理的范围内处理个人信息；
      </View>
      <View className="my-protocol__li">
        e) 依照《中华人民共和国个人信息保护法》规定在合理的范围内处理个人自行公开或者其他已经合法公开的个人信息；
      </View>
      <View className="my-protocol__section">
        7、如果您对我们收集和使用您的个人信息有任何疑问或需要提供进一步的信息，请通过本《用户隐私政策》公布的联系方式与我们联系。
      </View>
      <View className="my-protocol__title">二、如何使用Cookie和其他追踪技术</View>
      <View className="my-protocol__section">
        1、当您使用{projectName}时，我们可能通过Cookie或同类技术收集您的设备型号、操作系统、设备标识符、登录IP地址信息，以及缓存您的浏览信息、点击信息，以查看您的网络环境。通过Cookie，我们可以在您访问网站时识别您的身份，并不断优化网站的用户友好程度，并根据您的需要对网站做出调整。您也可以更改浏览器的设置，使浏览器不接受我们网站的Cookie，但这样可能会影响您对网站的部分功能的使用。
      </View>
      <View className="my-protocol__section">
        2、您可根据自己的偏好管理或删除某些类别的追踪技术。很多网络浏览器均设有“禁止追踪”（Do Not Track）功能，该功能可向网站发布“禁止追踪”的请求。除了我们提供的控件之外，您还可以选择在Internet浏览器中启用或禁用Cookie。大多数互联网浏览器还允许您选择是要禁用所有Cookie还是仅禁用第三方Cookie。默认情况下，大多数互联网浏览器都接受Cookie，但这可以更改。有关详细信息，请参阅Internet浏览器中的帮助菜单或设备随附的文档。
      </View>
      <View className="my-protocol__title">三、如何共享、转让、公开披露您的个人信息</View>
      <View className="my-protocol__section">
        <View className="my-protocol--strong">1、共享</View>
        <View className="my-protocol__li">a) 我们不会与除了{projectName}所属的科锐国际旗下的所有主体公司、附属公司、关联公司（以下统称科锐国际附属公司）以外的其他公司、组织或个人共享您的个人信息，但以下情况除外：</View>
        <View className="my-protocol__subli">i.个人用户提供的简历信息在投递职位后被用人单位获取。</View>
        <View className="my-protocol__subli">ii.个人提供的简历信息将被平台中的企业用户（用人单位）在简历库中主动搜索获取。</View>
        <View className="my-protocol__subli">iii.基于使用提供平台提供的其它服务内容需要。</View>
        <View className="my-protocol__subli">iv.在获取您的授权后，我们会与其他方共享您的个人信息。</View>
        <View className="my-protocol__subli">v.我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。</View>
        <View className="my-protocol__subli">vi.只有共享您的信息，才能实现我们的产品与/或服务的核心功能或提供您需要的服务。</View>
        <View className="my-protocol__subli">vii.与我们的附属公司共享：您的个人信息可能会与科锐国际附属公司共享。我们只会共享必要的个人信息，且受本隐私政策中所声明目的的约束。附属公司如要改变个人信息的处理目的，将再次征求您的授权同意。</View>
        <View className="my-protocol__li">
          <View>b) 与授权合作伙伴共享：</View>
          <View>仅为实现本政策中声明的目的，我们的某些服务（如即时在线通讯服务、短信通知服务等）将由授权合作伙伴提供。我们可能会与合作伙伴共享您的某些个人信息，以提供更好的客户服务和用户体验。我们仅会出于合法、正当、必要、特定、明确的目的共享您的个人信息，并且只会共享提供服务所必要的个人信息。我们的合作伙伴无权将共享的个人信息用于任何其他用途。如果您拒绝我们的合作伙伴在提供服务时收集为提供服务所必须的个人信息，将可能导致您无法在医脉同道平台使用该第三方服务。</View>
        </View>
        <View className="my-protocol__li">
          c) 我们的合作伙伴类型：
        </View>
        <View className="my-protocol__subli">
          i.商品或技术服务的供应商。我们可能会将您的个人信息共享给支持我们功能的第三方。这些支持包括为我们的供货或提供基础设施技术服务、代表我们发出短信的通讯服务供应商、物流配送服务、支付服务、数据处理等。我们共享这些信息的目的是可以实现我们产品与/或服务的核心功能，比如我们需要将您的订单号和订单金额与第三方支付机构共享以实现其确认您的支付指令并完成支付等。
        </View>
        <View className="my-protocol__subli">
          ii.分析服务类的授权合作伙伴。为了帮助分析类合作伙伴更好的分析医脉同道平台用户的使用情况，我们可能向其提供医脉同道用户的数量、地区分布、活跃情况等数据。但我们仅会在征得您的许可后，将不能识别您个人身份信息的数据或匿名信息共享给该类授权合作伙伴。
        </View>
        <View className="my-protocol__subli">
          iii.委托我们进行推广的合作伙伴。有时我们会代表其他企业向使用我们产品与/或服务的用户群提供促销推广的服务。我们可能会使用您的个人信息以及您的非个人信息集合形成的间接用户画像与委托我们进行推广的合作伙伴（“委托方”）共享，但我们仅会向这些委托方提供推广的覆盖面和有效性的信息，而不会提供您的个人身份信息，或者我们将这些信息进行汇总，以便它不会识别您个人。比如我们可以告知该委托方有多少人看了他们的推广信息或在看到这些信息后购买了委托方的商品，或者向他们提供不能识别个人身份的统计信息，帮助他们了解其受众或顾客。
        </View>
        <View className="my-protocol__li">
          d) 对我们与之共享信息的各类合作伙伴，我们会与其签署严格的保密协议，要求他们按照相关法律法规规范等的要求、我们的说明、本隐私政策以及其他任何相关的保密和安全措施来处理个人信息。
        </View>
      </View>
      <View className="my-protocol__section">
        <View className="my-protocol--strong">2、转让</View>
        <View>我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外：</View>
        <View className="my-protocol__li">a) 在获取明确同意的情况下转让：获得您的明确同意后，我们会向其他方转让您的个人信息;</View>
        <View className="my-protocol__li">b) 根据适用的法律法规、法律程序的要求、强制性的行政或司法要求所必须的情况进行提供；</View>
        <View className="my-protocol__li">c) 在涉及合并、收购或破产清算时，如涉及到个人信息转让，我们会在要求新的持有您个人信息的公司、组织继续受此隐私政策的约束，否则我们将要求该公司、组织重新向您征求授权同意。</View>
      </View>
      <View className="my-protocol__section">
        <View className="my-protocol--strong">3、公开披露</View>
        <View>我们仅会在以下情况下，公开披露您的个人信息：</View>
        <View className="my-protocol__li">a) 获得您明确同意后；</View>
        <View className="my-protocol__li">b) 基于法律的披露：在法律、法律程序、诉讼或政府主管部门强制性要求的情况下；</View>
        <View className="my-protocol__li">c) 在符合法律法规的前提下，当我们收到上述披露信息的请求时，我们会要求必须出具与之相应的法律文件，如传票或调查函。我们坚信，对于要求我们提供的信息，应该在法律允许的范围内尽可能保持透明。</View>
      </View>
      <View className="my-protocol__section">
        <View className="my-protocol--strong">4、共享、转让、公开披露个人信息时事先征得授权同意的例外</View>
        <View>在以下情况中，共享、转让、公开披露您的个人信息且无需事先征得您的授权同意：</View>
        <View className="my-protocol__li">a) 为订立、履行个人作为一方当事人的合同所必需；</View>
        <View className="my-protocol__li">b) 为履行法定职责或者法定义务所必需；</View>
        <View className="my-protocol__li">c) 为应对突发公共卫生事件，或者紧急情况下为保护自然人的生命健康和财产安全所必需；</View>
        <View className="my-protocol__li">d) 为公共利益实施新闻报道、舆论监督等行为，在合理的范围内处理个人信息；</View>
        <View className="my-protocol__li">e) 依照《中华人民共和国个人信息保护法》规定在合理的范围内处理个人自行公开或者其他已经合法公开的个人信息；</View>
      </View>
      <View className="my-protocol__section">
        5、根据法律规定，共享、转让经去标识化处理的个人信息，且确保数据接收方无法复原并重新识别个人信息主体的，不属于个人信息的对外共享、转让及公开披露行为，对此类数据的保存及处理将无需另行向您通知并征得您的同意。
      </View>
      <View className="my-protocol__title">四、如何存储和保护您的个人信息</View>
      <View className="my-protocol__section">
        1、个人信息的保存
        <View className="my-protocol__li">
          a) 您在使用{projectName}产品及服务期间，我们将持续为您保存您的个人信息。
          如果您注销账户账号或主动删除上述信息，我们会及时删除您的个人信息或进行匿名化处理。
          因法律规定需要留存个人信息的，我们不会再将其用于日常业务活动中。
        </View>
        <View className="my-protocol__li">
          b) 上述信息将存储于中华人民共和国境内。如需跨境传输，我们将会在符合国家对于信息出境的相关法律规定情况下，再次征得您的授权同意。
        </View>
      </View>
      <View className="my-protocol__section">
        2、个人信息的保护
        <View className="my-protocol__li">
          a) 我们从数据的生命周期角度出发，在数据收集、存储、显示、处理、使用、销毁等各个环节建立了安全防护措施，根据信息敏感程度的级别采取不同的控制措施，包括但不限于身份鉴别、SSL加密传输、访问控制、恶意代码防范、安全审计、AES256或者以上强度的加密算法进行加密存储、敏感信息脱敏显示等。
        </View>
        <View className="my-protocol__li">
          b) 我们建立了专门的安全组织、制度、流程以保障公司内部安全措施的有效执行。对可能接触到您信息的员工也采取了严格管理，可监控他们的操作情况，对于数据访问、内外部传输使用、脱敏、解密等重要操作建立了审批机制，并与上述员工签署保密协议等。与此同时，我们还定期对员工进行信息安全培训，要求员工在日常工作中形成良好操作习惯，要求员工遵守保密协议，并进行安全审计。
        </View>
        <View className="my-protocol__li">
          c) 您的账户均有安全保护功能，请妥善保管您的账号及密码信息，切勿将密码告知他人，如果您发现自己的个人信息泄露，特别是您的账号和密码发生泄露，请您立即与我们联系，以便我们采取相应的措施。
        </View>
        <View className="my-protocol__li">
          d) 尽管有前述的安全措施，但同时也请您理解在网络上不存在“完善的安全措施”。我们会按现有的技术提供相应的安全措施来保护您的信息，提供合理的安全保障，我们将尽力做到使您的信息不被泄露、损毁或丢失。
        </View>
        <View className="my-protocol__li">
          e) 请您及时保存或备份您的文字、图片等其他信息，您需理解并接受，您接入我们的服务所用的系统和通讯网络，有可能因我们可控范围外的因素而出现问题。
        </View>
      </View>
      <View className="my-protocol__title">五、您的权利</View>
      <View className="my-protocol__section">
        按照中国相关的法律、法规、标准，以及其他国家、地区的通行做法，我们保障您对自己的个人信息行使以下权利：
      </View>
      <View className="my-protocol__section">
        1.访问和编辑您的个人信息
        <View>除法律法规规定外，您有权随时访问和编辑您的个人信息，具体包括：</View>
        <View className="my-protocol__li">
          a) 您有权访问您的{projectName}平台的账户信息、简历信息、投递记录、我的收藏、订阅职位等信息。
        </View>
        <View className="my-protocol__li">
          b) 您可通过电脑访问{hostname}登录【个人中心-账号设置】，访问或者修改您账号绑定的手机号码、登录密码、隐私设置、屏蔽企业等信息，或通过网页中【平台联系方式】与我们取得联系。
        </View>
        <View className="my-protocol__li">
          c) 您可在小程序、网页或其它{projectName}产品中随时更新并保存您的个人简历信息以及相关投递信息。
        </View>
      </View>
      <View className="my-protocol__section">
        2、更改或撤销授权
        <View>
          您可以通过平台提供的功能来更改您的隐私设置：如果您是求职者，您可以在PC端网页“点击右上角个人用户名称——个人中心——账号设置——隐私设置”或者小程序端“点击“底栏‘我的’功能模块——隐私设置”来调整您选择对外展示的信息。
          您也可以通过设备功能来取消或撤回部分个人信息/设备权限的授权，例如：禁止浏览器的cookies功能，通过手机系统管理APP所能获取的信息等。您知悉并理解，更改或撤销授权将导致你无法使用平台的部分服务或具体功能。
        </View>
      </View>
      <View className="my-protocol__section">
        3、注销账号
        <View>
          您可以在我们的平台中直接申请注销账户，具体可通过平台中提供的联系方式，向我们申请注销和删除您的信息。您注销账户后，我们将停止为您提供产品与/或服务，并依据您的要求，除已做数据匿名化处理或法律法规另有规定外，删除您的个人信息。
        </View>
      </View>
      <View className="my-protocol__section">
        4、关闭个性化推荐
        <View>
          您可以通过【我的】-【隐私设置】-【个性化职位推荐】关闭个性化职位推荐服务。当您关闭个性化职位推荐后，我们将不再基于您的操作记录向您推荐、展示您可能感兴趣的与您较为匹配的职位或其他平台产品或服务。
        </View>
      </View>
      <View className="my-protocol__title">六、如何处理未成年人的个人信息</View>
      <View className="my-protocol__section">
        1、{projectName}重视对未成年人信息的保护。基于我们的产品、网站和服务的性质，根据国家劳动相关法律法规以及平台用户协议，
        您必须是<Text className="my-protocol--strong">18周岁及以上</Text>方可注册平台账号
      </View>
      <View className="my-protocol__section">
        2、我们不会故意从18岁以下的人士中收集个人信息，并且我们产品和服务的任何部分都不会针对18岁以下的人士。
      </View>
      <View className="my-protocol__section">
        3.如果您未满18岁，请不要以任何方式使用或访问我们的产品和服务。当我们得知我们无意中收集了18岁以下的人士的个人信息时，我们会根据适用法律法规进行删除或采取其他合适的措施。
      </View>
      <View className="my-protocol__title">七、本隐私政策的修订及更新</View>
      <View className="my-protocol__section">
        1、{projectName}有权在必要时修改本政策条款，并在变更生效前，以
        <Text className="my-protocol--strong my-protocol--underline">系统推送、电子邮件、短信或页面公告</Text>
        等方式通知到您。您可以随时在本平台查阅修改后的最新版本政策。
      </View>
      <View className="my-protocol__section">
        2、如您不同意修改后的政策，您有权终止对平台的授权。本政策更新后，如果您继续使用相应平台功能，即视为您已接受修改后的政策。
      </View>
      <View className="my-protocol__title">八、如何联系我们</View>
      <View className="my-protocol__section">
        如果您对本《用户隐私政策》及我们对您的个人信息的处理有任何疑问、意见、建议，请通过yimaitongdao@careerintlinc.com与我们联系。我们会在<Text className="my-protocol--strong">15个工作日内</Text>对您的请求予以答复。
      </View>
      <View className="my-protocol__title">九、隐私政策的适用范围及法律</View>
      <View className="my-protocol__section">
        本《用户隐私政策》与《{projectName}用户协议》共用构成您使用{projectName}服务的基本协议文件。本《用户隐私政策》适用中华人民共和国现行法律法规。
      </View>
      <View className="my-protocol__title">十、定义</View>
      <View className="my-protocol__section">
        本《用户隐私政策》中使用的特定词语，具有如下含义：
      </View>
      <View className="my-protocol__section">
        1、“本平台”、“{projectName}”或“我们”是指{companyName}、yimaitongdao.com、hr.yimaitongdao.com、{projectName}微信小程序，以及{projectName}微信公众号；
      </View>
      <View className="my-protocol__section">
        2、“关联公司”是指科锐数字科技（苏州）有限公司及其关联公司；
      </View>
      <View className="my-protocol__section">
        3、“您”或“用户”是指使用{companyName}运营的平台产品或者服务的注册用户以及购买增值服务的购买方；
      </View>
      <View className="my-protocol__section">
        4、“个人信息”是指以电子或者其他方式记录的与已识别或者可识别的自然人有关的各种信息，不包括匿名化处理后的信息。个人信息包括个人基本信息、个人身份信息、个人生物识别信息、网络身份标识信息、个人健康生理信息、个人教育工作信息、个人财产信息、个人通信信息、联系人信息、个人上网记录、个人常用设备信息、个人位置信息等。为免疑义，个人信息包括但不限于敏感个人信息；
      </View>
      <View className="my-protocol__section">
        5、“个人信息主体”是指个人信息所标识的自然人；
      </View>
      <View className="my-protocol__section">
        6、“敏感个人信息”是指一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括生物识别、宗教信仰、特定身份、医疗健康、金融账户、行踪轨迹等信息，以及不满十四周岁未成年人的个人信息。
      </View>
      <View className="my-protocol__section">
        7、“位置信息”是指IP地址、位置（或精确定位和粗略定位（IOS版））、WIFI接入点等信息；
      </View>
      <View className="my-protocol__section">
        8、“去标识化”是指通过个人信息的技术处理，使其在不借助额外信息的情况下，无法识别个人信息主体的过程；
      </View>
      <View className="my-protocol__section">
        9、“匿名化”是指通过对个人信息的技术处理，使个人信息主体无法被识别且处理后的信息不能被复原的过程。
      </View>
      <View className="my-protocol__title" style={{ textAlign: 'right' }}>
        {companyName}
      </View>
      <View className="my-protocol__section">
        附件一：《科锐数字科技（苏州）有限公司关联公司明细》
        <View>
          科锐数字科技（苏州）有限公司关联公司包括：北京科锐国际人力资源股份有限公司（注册地址：北京市朝阳区朝外大街16号中国人寿大厦1301）及其子公司;科锐尔人力资源服务（苏州）有限公司（注册地址：苏州工业园区星湖街328号创意产业园10-7F单元）及其子公司；苏州聚聘网络技术有限公司（注册地址：苏州工业园区星湖街328号创意产业园2-B405）及其子公司；北京欧格林咨询有限公司（注册地址：北京市朝阳区朝外大街16号1309A室）及其子公司；上海康肯市场营销有限公司（注册地址：上海市青浦区盈港路453号1022室）及其子公司；宁波康肯市场营销有限公司（注册地址：浙江省宁波市北仑区梅山大道商务中心十八号办公楼2371室）；北京才客脉聘技术有限公司（注册地址：北京市朝阳区朝外大街16号1号楼1308室）；上海科之锐人才咨询有限公司（注册地址：中国（上海）自由贸易试验区中科路1358号，环科路999弄1号楼1001室）及其子公司；东莞科之锐人力资源服务有限公司（注册地址：东莞市松山湖高新技术产业开发区科技四路16号光大We谷C2栋509室）；成都科之锐人力资源服务有限公司（注册地址：中国（四川）自由贸易实验区成都高新区天府大道中段688号3栋18层1803、1804号）；杭州锐致商务咨询有限公司（注册地址：杭州市下城区环城北路139号1幢803室）；天津薪睿网络技术有限公司（注册地址：天津市津南区咸水沽镇聚兴道7号1号楼541-40）；上海科锐派人才咨询有限公司（注册地址：上海市静安区华盛路76-82号501室）；上海云武华科技有限公司（注册地址：上海市徐汇区桂平路418号1301室）；科锐翰林（武汉）咨询有限公司（注册地址：武汉市江汉区中央商务区泛海国际SOHO城第3,4,6幢3号楼26层7号）；北京融睿诚通金融服务外包有限公司（注册地址：北京市丰台区东铁匠营249号5幢507）及其子公司；天津津科智睿人力资源有限公司（注册地址：天津市津南区津南经济开发区（西区）香港街3号2号楼302-49）；安徽融睿人力资源有限公司（注册地址：安徽省芜湖市鸠江区四褐山街道龙山西路鞍山家园商贸楼303号）；天津易科睿企业服务有限公司（注册地址：天津市津南区咸水沽镇雅润路海棠众创大街D区中国天津人力资源服务产业园-X-No.C202
          ）；湖南科睿人力资源有限公司（注册地址：湖南省衡阳市珠晖区衡州大道1号衡阳丽波国际酒店4楼东面028房）；天津智锐人力资源有限公司（注册地址：天津自贸试验区（空港经济区）空港国际物流区第二大街1号312室（天津信至尚商务秘书有限公司托管第828号））；北京融睿人力资源有限公司（注册地址：北京市通州区潞城镇武兴路7号A0032室）；秦皇岛速聘信息咨询有限公司（注册地址：秦皇岛市海港区新华街新天地商务中心A座1806）及其子公司；安拓奥古（北京）人力资源服务有限公司（注册地址：北京市朝阳区建国门外大街甲6号1幢D座6层603单元）及其子公司；苏州安拓奥古人力资源服务有限公司（注册地址：苏州市工业园区星湖街328号创意产业园10-7F-2单元）及其子公司；ANTAL国际商务咨询（北京）有限公司（注册地址：北京市朝阳区建国门外大街甲6号1幢D座6层601单元）；渝飞安拓人力资源服务重庆有限公司（注册地址：重庆市渝北区春华大道99号南区1号楼9层906号）；汇聘管理咨询（上海）有限公司（注册地址：上海市静安区中兴路1500号17楼B室、18楼A室）；杭州科之锐人力资源有限公司（注册地址：杭州市下城区环城北路139号1幢802室）；科锐国际人力资源（武汉）有限责任公司（注册地址：武汉市江汉区中央商务区泛海国际SOHO城第3,4,6幢3号楼26层3、4、5、6号）；科锐江城人力资源管理咨询（武汉）有限公司（注册地址：武汉市江汉区王家墩中央商务区泛海国际SOHO城3,4,6栋3号楼单元5层10室）；北京亦庄国际人力资源有限责任公司（注册地址：北京市北京经济技术开发区荣华中路10号1幢A座2301）及其子公司；西藏亦庄人力资源有限责任公司（注册地址：西藏自治区拉萨市堆龙德庆县工业园管委会476号）；北京兴航国际人力资源管理有限责任公司（注册地址：北京市大兴区榆垡镇榆顺路12号1-11室）；浙江亦庄人力资源有限责任公司（注册地址：浙江省宁波保税区银天大厦101-61室）；乌鲁木齐科锐高新人才服务有限公司（注册地址：新疆乌鲁木齐高新技术产业开发区（新市区）冬融街567号高新人才大厦北塔十三楼13-5）；科锐国际人力资源（长春）有限公司（注册地址：长春净月高新技术产业开发区净月大街2950号民生大厦5702室）；科锐致新人力资源（长春）有限公司（注册地址：长春净月高新技术产业开发区净月大街2950号民生大厦5704室）；科锐智慧科技（重庆）有限公司（注册地址：重庆市沙坪坝区景阳路37号2F-B2栋13楼）；融睿诚通数字科技（湖北）有限责任公司（注册地址：武汉东湖新技术开发区关东街道高新二路22号中国光谷云计算海外高新企业孵化中心1，2号研发办公楼栋2号楼1701-1703（自贸区武汉片区））；科锐数字科技（芜湖）有限公司（注册地址：安徽省芜湖市繁昌区横山产业新城一楼101）；渝飞安拓人力资源服务重庆有限公司（注册地址：重庆市渝北区春华大道99号南区1号楼9层906号）。
        </View>
      </View>
    </View >
  )
}

export default Protocol
