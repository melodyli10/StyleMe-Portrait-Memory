const rows=`Editorial portrait placeholder|编辑肖像占位|에디토리얼 사진 자리
Editorial portrait placeholders|编辑肖像占位|에디토리얼 사진 자리
Photography pending|等待正式摄影素材|사진 준비 중
Portrait placeholders. Approved real photography will be added.|当前为占位图，之后将加入获准使用的真实摄影。|사진 자리 표시입니다. 승인된 실제 사진을 추가할 예정입니다.
Homepage portrait slots await approved real photography. They are not customer results.|首页等待获准使用的真实摄影，并非客户编辑效果。|홈페이지 사진은 승인된 실제 사진을 기다리고 있습니다. 고객의 편집 결과가 아닙니다.
Try a sample portrait|试用示例肖像|샘플 사진 체험
Try Sample|试用示例|샘플 체험
Try sample portrait|试用示例肖像|샘플 사진 체험
Real editing, without uploading your photo.|无需上传照片，即可体验真实编辑。|사진을 업로드하지 않고 실제 편집을 체험하세요.
Sample credits & privacy|示例来源与隐私|샘플 출처 및 개인정보
One approved Pexels demo. Not a customer or an editing result. The sample cannot teach your profile or enter evaluation.|一张获准使用的 Pexels 示例，并非客户或编辑效果。示例不可用于教学档案或评估。|승인된 Pexels 샘플 한 장입니다. 고객이나 편집 결과가 아닙니다. 프로필 학습 및 평가에 사용할 수 없습니다.
Demo portrait — editing and export enabled. Upload your own photo to teach StyleMe.|示例肖像：可编辑和导出。请上传自己的照片来教会 StyleMe。|샘플 사진: 편집과 내보내기가 가능합니다. StyleMe를 가르치려면 내 사진을 업로드하세요.
Loading demo portrait…|正在加载示例肖像…|샘플 사진 불러오는 중…
Sample could not load. Try uploading a portrait.|示例无法加载，请尝试上传肖像。|샘플을 불러오지 못했습니다. 사진을 업로드해 주세요.
Start with one clear portrait. Your photo stays on this device.|从一张清晰肖像开始。照片保留在此设备上。|선명한 사진 한 장으로 시작하세요. 사진은 이 기기에 보관됩니다.
Original restored. Saved preferences are unchanged.|已恢复原图，保存的偏好不变。|원본을 복원했습니다. 저장한 설정은 그대로입니다.
Processing locally|正在本地处理|기기에서 처리 중
Ready to upload|等待上传|업로드 준비
Detection unavailable|检测不可用|감지 불가
Edited|已编辑|편집됨
A personal style should not cost you your privacy. You decide what to keep.|个人风格不应以隐私为代价。保留什么，由你决定。|나만의 스타일을 위해 개인정보를 포기할 필요는 없습니다. 무엇을 남길지 직접 결정하세요.
On your device|在你的设备上|내 기기에서
Your uploaded portraits and edited pixels stay in this browser. We do not send them to an editing service or save them in your profile.|上传的肖像和编辑像素留在浏览器内，不会发往编辑服务或保存到档案中。|업로드한 사진과 편집 픽셀은 브라우저에 머뭅니다. 편집 서비스로 전송하거나 프로필에 저장하지 않습니다.
Only what you confirm|仅保存你确认的内容|확정한 것만
Local memory keeps confirmed strengths, compact geometry ratios and duplicate-check digests. Reset clears active edits; profile settings let you delete saved choices.|本地记忆仅保留已确认强度、精简几何比率和重复检测摘要。重置清除当前编辑，档案设置可删除已保存选择。|로컬 메모리는 확정한 강도, 간단한 기하 비율과 중복 확인 요약만 보관합니다. 초기화는 현재 편집을 지우고, 프로필 설정에서 저장한 선택을 삭제할 수 있습니다.
A separate space to try|独立的试用空间|별도의 체험 공간
The built-in sample is for editing and export only. It cannot become a teaching example or an evaluation case.|内置示例仅用于编辑和导出，不会成为教学示例或评估案例。|내장 샘플은 편집과 내보내기 전용입니다. 학습 예시나 평가 사례가 될 수 없습니다.
You control the records|记录由你掌控|기록은 내가 관리
The local Evaluation Lab stores decisions, scores and file digests, not photographs. Exported results are files you control. Browser storage is not encrypted; use your own device.|本地评估实验室保存决定、评分和文件摘要，不保存照片。导出文件由你掌控。浏览器存储未加密，请使用自己的设备。|로컬 평가실은 판단, 점수, 파일 요약만 저장하며 사진은 저장하지 않습니다. 내보낸 파일은 직접 관리합니다. 브라우저 저장소는 암호화되지 않으므로 개인 기기를 사용하세요.
Network requests & local storage|网络请求与本地存储|네트워크 요청 및 로컬 저장소
The face model downloads from Google. Web fonts load from Google Fonts and jsDelivr. These services receive normal connection information, but never your uploaded portrait pixels.|人脸模型从 Google 下载，网页字体从 Google Fonts 和 jsDelivr 加载。这些服务接收常规连接信息，但不接收上传的肖像像素。|얼굴 모델은 Google에서, 웹 글꼴은 Google Fonts와 jsDelivr에서 불러옵니다. 이 서비스에는 일반 연결 정보만 전달되며 업로드한 사진 픽셀은 전달되지 않습니다.
Clearing browser data removes your saved profile. There is no account or cloud backup.|清除浏览器数据会删除保存的档案，无账号或云端备份。|브라우저 데이터를 지우면 저장 프로필도 삭제됩니다. 계정이나 클라우드 백업은 없습니다.`
export const refinementDictionary=Object.fromEntries(rows.split('\n').map(row=>{const[en,zh,ko]=row.split('|');return[en,{en,zh,ko}]}))
