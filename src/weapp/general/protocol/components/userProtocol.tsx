import { APP_PROJECT_NAME, APP_COMPANY_NAME } from '@/config'
import { View, Text } from '@tarojs/components'
import './index.scss'

const hostname = 'https://www.yimaitongdao.com'
const projectName = APP_PROJECT_NAME
const companyName = APP_COMPANY_NAME

const Protocol = () => {
  return (
    <View className="my-protocol__boby">
      <View className="my-protocol__section">更新时间：   2021年 12 月 09 日</View>
      <View className="my-protocol__section">生效时间：   2021 年 12月 15 日</View>
      <View className="my-protocol__section">
        <View>欢迎您注册医脉同道账号并使用医脉同道的服务。</View>
        《{projectName}用户协议》（以下简称“本协议”）是您与{companyName}之间就使用{projectName}服务等相关事宜所自愿订立的契约，请您在使用前，务必仔细阅读并充分理解本协议的所有内容。在本协议中，请您务必特别注意及重点阅读与您的权利及义务密切相关的条款。
      </View>
      <View className="my-protocol__section">
        本协议中的{projectName}服务是指由{companyName}运营的“{projectName}{hostname}（以下简称“{projectName}”或“本平台”）以及微信小程序、微信公众号等相关平台账号所提供的全部服务。本公司通过{projectName}平台为您（指个人或企业）招聘提供相应的服务。
      </View>
      <View className="my-protocol__title">一、用户协议说明</View>
      <View className="my-protocol__section">
        1、为了您能够更好的使用{projectName}的相关服务，请您仔细阅读以下条款。如果您对本协议的任何一项条款有异议，您可以选择不进入{projectName}。一旦您注册成功，无论是登录{projectName}平台，还是使用{projectName}平台发布任何内容，都代表您已完全理解并接受本协议的所有条款,并与医脉同道达成一致，成为医脉同道的用户。
      </View>
      <View className="my-protocol__section">
        2、本协议中的“用户”是指所有使用{projectName}平台及相关服务的企业端用户及个人求职用户，包括法人、自然人和其他组织等，在本协议中均统称为“您”或“用户”。
      </View>
      <View className="my-protocol__section">
        3、本协议是您与{companyName}，就您注册、登录、使用“{projectName}”相关的网页、小程序等，并获得{projectName}提供的相关服务所订立的协议。公司有权按照{projectName}及相关服务或运营的需要单方决定，安排或指定其关联公司、控制公司、继承公司或公司认可的第三方公司继续运营{projectName}平台。同时，就医脉平台中涉及的一些服务可能会由公司的关联公司、控制公司、继承公司或公司认可的第三方公司向您提供。您知晓、同意并接受相关服务内容，即视为接受相关权利义务关系亦受本协议约束。
      </View>
      <View className="my-protocol__section">
        4、根据国家法律法规变化及运营的需要，{projectName}有权对本协议的内容及条款不时地进行更新修改。修改后的新用户协议一旦被在平台上公布即表示该协议立即生效，并取代之前的用户协议。为了您更好的使用本平台，您应不时关注平台的公告，注意查看更新后的协议内容是否接受。若您对更新后的协议有异议，应立即停止使用本平台的服务；若更新后的协议已在平台公布，您在此时依然选择继续使用本平台的任何服务，即视为您已阅读、理解并认同新协议的所有条款。
      </View>
      <View className="my-protocol__title">二、{projectName}服务说明</View>
      <View className="my-protocol__section">
        1、{projectName}是一个专注于大健康行业的垂直招聘平台，主要为用户提供招聘求职服务，包括但不仅限于线上招聘、职位订阅、职位推荐、职位搜索、线上招聘会、校园招聘等产品及服务，为用户提供专业的人才招聘服务。
      </View>
      <View className="my-protocol__section">
        2、{projectName}在提供网络招聘服务的同时，可能会对部分网络服务收取一定的费用。具体收费标准请参考相关页面。如果用户拒绝支付费用，则不能享受相应的增值服务。付费业务静载本协议的基础上另行规定服务条款，以规范付费业务的内容和双方的权利义务，
        包括但不仅限于<Text className="my-protocol--link">《{projectName}增值服务协议》</Text>、<Text className="my-protocol--link">《{projectName}发票管理规范》</Text>。
        用户应该认真阅读，当您选择购买增值服务时，则视为您已接受前述所有条款。
      </View>
      <View className="my-protocol__section">
        <View>3、职位发布服务</View>
        <View>当您在本平台注册成功后，即可根据自身需求完成企业认证，发布职位。但请您注意，在发布招聘信息时，以下行为将不被允许：</View>
        <View className="my-protocol__li">a) 不得发布违反法律法规的职位信息：</View>
        <View className="my-protocol__subli">i. 包含招聘未满18周岁的未成年人；</View>
        <View className="my-protocol__subli">ii.包含传销、直销、广告（寻求合作）、加盟商、经销商、代理商等内容；</View>
        <View className="my-protocol__subli">iii.包含色情、淫秽、赌博、凶杀、暴力、恐怖及教唆犯罪、政治敏感内容；</View>
        <View className="my-protocol__subli">iv.包含歧视内容，如：性别歧视、民族歧视、种族歧视、宗教信仰歧视、地域歧视、婚育歧视等内容。</View>
        <View className="my-protocol__subli">v.包含违反《劳动合同法》等相关法律法规规定的内容，如：不得发布低于最低工资水平的薪资信息。</View>
        <View className="my-protocol__li">b) 不得发布以下类型职位：</View>
        <View className="my-protocol__subli">i.职位名称包含职位名称以外信息，如急招、热招等；</View>
        <View className="my-protocol__subli">ii.职位信息包含与职位本身无关信息，如联系方式、邮箱、微信、微博、QQ等；</View>
        <View className="my-protocol__subli">iii.多次被用户举报。</View>
        <View className="my-protocol__li">c) 其他具体职位发布规则请查看<Text className="my-protocol--link">《{projectName}职位发布规则》</Text></View>
      </View>
      <View className="my-protocol__section">
        <View>4、简历发布服务</View>
        当您在本平台注册成功后，即可根据自身需求完成个人认证，上传个人简历。但请您注意，在上传个人简历时，以下行为将不被允许：
        <View className="my-protocol__li">a) 故意提供虚假的身份信息进行注册；</View>
        <View className="my-protocol__li">b) 发布虚假、不准确、不完整或具有误导性的个人求职信息；</View>
        <View className="my-protocol__li">c) 利用他人的名义发布任何信息；</View>
        <View className="my-protocol__li">d) 发布任何与求职无关的消息、商业广告等；</View>
        <View className="my-protocol__li">e) 以任何形式侵犯他人的著作权、版权、商标权、商业秘密或其他知识产权；</View>
        <View className="my-protocol__li">f) 侵犯个人和社会大众的隐私安全。</View>
      </View>
      <View className="my-protocol__section">
        5、{projectName}不断创新以向其用户提供最优体验。您认知并同意{projectName}提供的服务的形式和本质可不经实现通知您而不时变换。本平台及相关服务更新或部分服务内容更新后，在可能的情况下，{projectName}将以包括但不限于系统提示、公告、短信或电子邮件的形式通知用户。用户有权选择是否接受更新版本或服务，若用户不接受，则部分功能将受到限制或不能继续正常使用。
      </View>
      <View className="my-protocol__section">
        6、为了保证{projectName}平台及相关服务安全、提升用户服务，您使用{projectName}及相关服务需自行准备与平台及相关服务有关的终端设备，包括但不仅限于个人电脑及配备上网装置。
        一旦您在其终端设备中进入了{projectName}平台，即视为您使用{projectName}平台及相关服务。为了实现{projectName}平台的全部功能，您可能需要将其终端设备联网，您理解由您承担所需要的费用，如流量费、上网费等。
      </View>
      <View className="my-protocol__section">
        7、{projectName}有权通过拨打电话、发送短信或者电子邮件等方式，告知用户{projectName}服务相关的广告信息、促销优惠等营销信息，以及邀请用户参与版本测试、用户体验反馈、回访等活动。除系统通知或重要信息外，用户可以选择不接收上述信息。
      </View>
      <View className="my-protocol__section">
        8、为了提高{projectName}用户求职招聘的效率和成功率，
        {companyName}可能会将{projectName}用户的信息公开展示范围扩大至
        北京科锐国际人力资源股份有限公司旗下的其他产品使用。您可通过{projectName}的
        <Text className="my-protocol--link">《个人信息保护政策》</Text>了解我们如何保证您的个人信息的安全。
      </View>

      <View className="my-protocol__title">三、平台使用规则</View>
      <View className="my-protocol__section">
        1、在您成功注册本平台后，{projectName}将会给予您一个用户账号及相应的密码，您应当妥善保管您的账号和密码。您应当对该账户进行的所有活动和事件负法律责任。
      </View>
      <View className="my-protocol__section">
        2、您应该对在{projectName}中所填写的注册信息的真实性、合法性、有效性承担全部责任。若用户违反本规则，导致其他用户误会或者使{projectName}平台经济或者名誉受损，{projectName}则有权立即停止提供任何服务，收回其账号，并且有该用户将独自承担由此产生的一起经济损失及法律责任。
      </View>
      <View className="my-protocol__section">
        3、用户在使用{projectName}时，不得利用{projectName}的人才服务制作、上传、复制、发布、传播或者转载如下内容：
      </View>
      <View className="my-protocol__li">
        a) 反对宪法所确定的基本原则的；
      </View>
      <View className="my-protocol__li">
        b) 危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；
      </View>
      <View className="my-protocol__li">c) 损害国家荣誉和利益的；</View>
      <View className="my-protocol__li">d) 宣扬邪教和封建迷信的；</View>
      <View className="my-protocol__li">
        e) 散布谣言，扰乱社会秩序，破坏社会稳定的；
      </View>
      <View className="my-protocol__li">
        f) 散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；
      </View>
      <View className="my-protocol__li">
        g) 侮辱或者诽谤他人，侵害他人合法权益的；
      </View>
      <View className="my-protocol__li">
        h) 侮辱、滥用英烈形象，否定英烈事迹，美化粉饰侵略战争行为的；
      </View>
      <View className="my-protocol__li">
        i) 含有法律法规、各项法律条款、条例及其他任何具有法律效力的规范所禁止的其他内容的信息。
      </View>
      <View className="my-protocol__section">
        4、用户不得冒充其他任何人或机构，包括但不仅限于冒充医脉同道工作人员或以虚伪，不真实的方式陈述或谎称与任何人或机构有关。
      </View>
      <View className="my-protocol__section">
        5、用户不得发布、传播侵犯任何人的肖像权、名誉权、隐私权、专利权、商标权、著作权、商业机密的信息或言论。
      </View>
      <View className="my-protocol__section">
        6、用户不得未经合法授权而截获、篡改、收集、储存或删除他人个人信息、电子邮件或其他数据资料，或将获知的此类资料用于任何非法或不正当目的。
      </View>
      <View className="my-protocol__section">
        7、{projectName}有权对用户使用{projectName}的情况进行审查和监督。若您在使用{projectName}服务时，发现有违法违规行为或违反本规则的用户，应及时向{projectName}反馈。
      </View>
      <View className="my-protocol__section">
        8、若用户多次涉嫌违反本规则，或有其他明显损害{companyName}利益或违法行为，经本平台发现或多用户投诉后核实的，{projectName}有权视情节严重程度采取相应措施：
      </View>
      <View className="my-protocol__li">
        a) {projectName}有权驳回发布申请或者进行信息删除等措施；
      </View>
      <View className="my-protocol__li">
        b) {projectName}将会以电话、短信或邮件的形式通知并下架用户所发布的职位。 接到通知后，用户可以通过客户服务渠道向{projectName}提交申诉；
      </View>
      <View className="my-protocol__li">
        c) 情节严重者，{projectName}有权暂时乃至永久停止该用户的账户且不做解封；
      </View>
      <View className="my-protocol__li">
        d) 若用户违反本规则造成{projectName}被第三方索赔，用户应全额赔偿{projectName}一切费用，费用包括但不仅限于赔偿费、律师费、公证费、诉讼代理费等所有为此支付的其他合理费用。
      </View>
      <View className="my-protocol__title">四、隐私政策</View>
      <View className="my-protocol__section">
        {projectName}依法保护用户个人信息和隐私信息。详细隐私协议条款见{projectName}<Text className="my-protocol--link">《用户隐私政策》</Text>。
      </View>
      <View className="my-protocol__title">五、知识产权</View>
      <View className="my-protocol__section">
        1、{projectName}是一个大健康行业的垂直招聘平台，我们尊重和鼓励{projectName}的用户提供服务所需要的内容，{projectName}充分认知到保护知识产权对本平台生存和发展的重要性，并承诺将保护知识产权作为{projectName}运营的基本原则之一。
      </View>
      <View className="my-protocol__section">
        2、企业用户和个人用户均应谨慎对待他方之行为，{projectName}无法对各用户的线下行为负责。若因为他方之行为给用户造成任何不利影响的，{projectName}不承担任何法律责任。
      </View>
      <View className="my-protocol__section">
        3、{projectName}提供的网络服务中包含的标识、排版设计、排版方式、文本、图片、图形等均受著作权、商标权及其他法律保护，未经相关权利人（ {projectName}及其他原始权利人）同意，上述内容均不得在任何平台被直接或者间接发布、使用、出于发布或者使用目的的改写或再发行，或被用于其他任何商业目的。
      </View>
      <View className="my-protocol__section">
        4、您在{projectName}上上传或者发表的信息内容，应保证该内容的真实性和有效性，并且保证该内容不会侵犯任何第三方的合法权益。若第三方提出对著作权有异议，{projectName}有权根据实际情况删除相关内容，并且有权对该用户追究法律责任。对于{projectName}或者任何第三方造成的经济损失，该用户应全额赔偿。
      </View>
      <View className="my-protocol__section">
        5、您同意不以任何形式为公众用途或商业目的出售或修改{projectName}内容，或为非{projectName}平台的相关产品和服务复制、显示、公开演示、发布或以其他方式使用{projectName}平台内容。
      </View>
      <View className="my-protocol__section">
        6、为向用户提供便利而设置的外部链接网址，{projectName}并不保证其准确性、
        安全性和完整性，亦不代表{projectName}对其链接内容的认可，请您谨慎确认后再使用。
        由于与{projectName}链接的其他网站或用户所使用的网络运营商所造成的个人信息泄露或其他任何损失，
        以及由此而导致的任何法律争议和后果均由其他网站或用户所使用的网络运营商负责；
      </View>
      <View className="my-protocol__section">
        7、除非另有明确的书面说明，在符合法律法规规定的情况下，{projectName}不对本平台中的信息、内容、材料或服务做任何形式的明示或默示的声明或担保。
      </View>
      <View className="my-protocol__section">
        8、在法律允许范围内，{projectName}及其关联公司对于本用户协议项下任何索赔的全部赔偿责任限于您因使用服务而向我们支付的金额。
      </View>
      <View className="my-protocol__title">六、违约侵权责任</View>
      <View className="my-protocol__section">
        1、用户使用虚假身份信息、公司信息进行注册，发布虚假招聘、求职信息，发布含有传销、色情、反动等严重违法内容，视为严重违反本协议，应当承担给{projectName}造成的经济损失和名誉损失。
      </View>
      <View className="my-protocol__section">
        2、侵犯企业或个人合法权益的侵权举报，包括但不仅限于涉及：
      </View>
      <View className="my-protocol__li">a) 个人隐私：发布内容中直接涉及身份信息，如个人姓名、家庭住址、身份证号码、工作单位、私人电话等详细个人隐私；</View>
      <View className="my-protocol__li">b) 商业侵权：泄露企业商业机密及其他根据保密协议不能公开的讨论内容。</View>
      <View className="my-protocol__section">
        3、若用户多次涉嫌违反本协议，或有其他明显损害公司利益或违法行为，经本平台发现或多用户投诉后核实的，医脉同道有权视情节严重程度采取相应措施：
      </View>
      <View className="my-protocol__li">a) 医脉同道有权驳回发布申请或者进行信息删除等措施；</View>
      <View className="my-protocol__li">b) 医脉同道将会以电话、短信或邮件的形式通知并下架用户所发布的职位。 接到通知后，用户可以通过客户服务渠道向医脉同道提交申诉；</View>
      <View className="my-protocol__li">c) 情节严重者，医脉同道有权暂时乃至永久停止该用户的账户且不做解封；</View>
      <View className="my-protocol__li">d) 若用户违反本规则造成医脉同道被第三方索赔，用户应全额赔偿医脉同道一切费用，费用包括但不仅限于赔偿费、律师费、公证费、诉讼代理费等所有为此支付的其他合理费用。</View>
      <View className="my-protocol__section">
        4、处理流程：
      </View>
      <View className="my-protocol__li">
        a) 出于网络平台的监督属性，并非有所申请都必须受理。{projectName}自收到举报的
        <Text className="my-protocol--strong">7个工作日内</Text>处理。处理期间，不提供任何电话、邮件及其他方式的查询服务；
      </View>
      <View className="my-protocol__li">b) {projectName}为唯一的官方违约侵权投诉渠道，暂不提供任何其他方式处理此业务；</View>
      <View className="my-protocol__li">c) 用户在{projectName}中的商业行为引发的法律纠纷，由交易双方自行处理，与{projectName}无关。</View>
      <View className="my-protocol__title">七、协议的变更与终止</View>
      <View className="my-protocol__section">
        1、{projectName}有权依法随时对本协议的任何条款进行变更和修改。一旦新协议在平台公布，则代表该版协议立即生效。{projectName}会将最新版本的《{projectName}用户协议》以系统消息、短信或者电子邮件的形式发送给用户，请您注意查看。
      </View>
      <View className="my-protocol__section">
        2、若您对新协议的任何条款有异议，请立即停止使用本平台或申请注销账号。请注意，若您选择注销账号，则该账户中未使用的付费权益将在注销后清空。
      </View>
      <View className="my-protocol__section">
        3、若您在新协议公布后，继续使用本平台或{projectName}的其他增值服务时，则意味着您已经阅读、理解并同意新用户协议的所有条款。
      </View>
      <View className="my-protocol__title">八、责任声明</View>
      <View className="my-protocol__section">
        1、{projectName}作为信息服务平台，所有用户的信息、招聘信息等均由用户自行上传、发布。
        本平台对用户的真实资信状况、用户发布信息的真实性、合法性、准确性等不作保证。
        {projectName}不对用户的简历的内容做实质性审查，不为用户简历的真实、完整、准确做保证；
        不对用户实际经营状况做实质性审查，不对用户的资信状况做保证。用户应该自行判断。
        若因上述原因给第三方造成损失，{projectName}不承担任何责任。
      </View>
      <View className="my-protocol__section">
        2、本平台致力于为各用户提供优质、稳定的服务。但本平台不能百分百保证：
      </View>
      <View className="my-protocol__li">
        a) 能满足所有用户的各种需求；
      </View>
      <View className="my-protocol__li">
        b) 能不出现任何系统宕机、波动；
      </View>
      <View className="my-protocol__li">
        c) 能不出现任何的数据丢失。
      </View>
      <View className="my-protocol__section">
        3、若因网络运营商的原因或者本平台进行网络调整、正常的系统维护升级等原因造成您使用本平台时出现无法正常访问的情况，{projectName}不承担任何责任。但在{projectName}进行正常系统维护升级前可能会以弹窗、短信、或电子邮件的形式进行通知，请您注意查看。
      </View>
      <View className="my-protocol__section">
        4、您通过本平台获取的任何资料和信息，无论其来自本平台或者任何外部链接，{projectName}不对其做出任何保证。
        {projectName}平台中会提供与其它网站或资源的网络链接，用户可能会因此跳转至其它运营经营的网站，
        但不表示{projectName}与这些运营商有任何关联关系并且不为该类网站的任何内容、广告等其他资料保证或者负责。
        若您因为使用或依赖任何此类网站或资源发布的任何内容或服务产生任何损害或损失，
        {projectName}平台不负任何直接或间接的责任。
        涉及上述条款中的情形，而造成的用户利润、商誉等损失，{projectName}不承担任何直接、间接、附带、惩罚性的赔偿。
      </View>
      <View className="my-protocol__section">
        5、{projectName}将不时指定本平台的关联公司或者第三方作为本平台的代理、基础服务商、基数支持方等，
        以便为用户提供本平台相应的服务。
        如用户需要使用第三方服务以便使用本平台相应功能（例如：使用第三方账号登录本平台、使用第三方支付工具购买本平台付费服务等），还应相应遵守第三方服务提供商的相应规则。
      </View>
      <View className="my-protocol__title">九、通知</View>
      <View className="my-protocol__section">
        1、当您注册企业账号并接受{projectName}服务时，您应该向{projectName}提供真实有效的联系方式（联系电话、电子邮箱等），以便{projectName}能够随时联系您并及时向您发出有效的通知。
        此外，{projectName}有可能会以浏览界面跳出的弹窗等形式进行通知，该通知形式也视作向您发出的有效通知。
      </View>
      <View className="my-protocol__section">
        2、您应当保证所提供的联系方式是准确的、有效的，并且进行实时更新。如果因提供的联系方式不准确，或不及时告知变更后的联系方式，而导致消息通知无法送达或及时传达，由您自行承担由此可能产生的法律后果。
      </View>
      <View className="my-protocol__title">十、其他</View>
      <View className="my-protocol__section">
        1、{projectName}平台的所有权、运营权、解释权归{companyName}所有。{projectName}拥有对本协议的最终解释权。
      </View>
      <View className="my-protocol__section">
        2、用户与本平台的任何纠纷，均可以通过协商的途径联系解决。若协商未果，则任意一方均可向北京仲裁委员会提起仲裁，最终解决方案以仲裁裁决为准。
      </View>
      <View className="my-protocol__section">
        3、本协议的订立、生效、解释、执行、管辖、争议的解决均适用于中华人民共和国法律。
      </View>
      <View className="my-protocol__title" style={{ textAlign: 'right' }}>
        {companyName}
      </View>
    </View>
  )
}

export default Protocol
