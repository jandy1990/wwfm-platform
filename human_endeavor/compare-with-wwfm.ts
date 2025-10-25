/**
 * WWFM Goal Gap Analysis
 * Compares top 300 internet-searched goals with existing WWFM goals
 */

import * as fs from 'fs';
import * as path from 'path';

interface ScoredGoal {
  normalized: string;
  original: string[];
  sources: string[];
  score: number;
}

interface WWFMGoal {
  id: string;
  title: string;
  arena_id: string;
}

interface GapAnalysis {
  rank: number;
  goal: string;
  score: number;
  sources: string[];
  wwfmMatch?: string;
  matchScore?: number;
  status: 'covered' | 'partial' | 'gap';
}

// WWFM goals from database
const WWFM_GOALS: WWFMGoal[] = [
  {"id":"9efd2e89-095b-47af-8123-39138ee4ff31","title":"Ace interviews","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"a7c0d79e-4b60-4fb6-89c8-7dbdaff8fb56","title":"Beat afternoon slump","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"0772b2d8-3194-485e-affa-3efdb8ea1b77","title":"Bike long distances","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"a72b9494-5508-4ded-8c6c-94dc96910009","title":"Bounce back from firing","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"68099253-5b89-48cf-a8dd-08f5118b9c19","title":"Break bad habits","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"f26f7bc7-4caf-4e30-8e2a-5046f1608b5a","title":"Break porn addiction","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"ec0a9b79-05ac-47ea-809c-d9bc10fb730b","title":"Budget home projects","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"0cea6523-b928-4855-91a5-5c3e41e87e4b","title":"Build a coordinated wardrobe","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"acacf4ec-79b9-41eb-996e-599d21fc8df9","title":"Build confidence","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"2244e53d-d88b-4e9f-98e7-3bbb3ca6dfc1","title":"Build emotional intelligence","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"c5b82904-8202-4713-889f-3cb8d3a2f65f","title":"Build financial stability","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"ae0082f6-9e1f-47f4-be07-635a4775a10f","title":"Build freelance career","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"0bf738fe-dbe9-4131-82d3-42c39b600296","title":"Build home workout habit","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"ac62f0f5-eacf-41b3-950b-0e7ff9dd80d0","title":"Build muscle definition","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"38fc0df5-6a7a-4ebd-9bb9-79a297562886","title":"Build muscle mass","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"2b5d7aca-f22a-4c4e-a17f-52f0436daf02","title":"Build mutual aid network","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"2177f4dc-41df-492d-8a7f-9c4827d689bd","title":"Build self-discipline","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"4474e00e-d59a-42c9-ac5c-7bda99d6578a","title":"Change careers successfully","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"7338e1ae-8bdf-4b9f-bdf5-eb5021aad086","title":"Change negative self-talk","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"b54f0730-006a-4c77-90c0-9625d98effba","title":"Channel anger productively","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"9771ac25-d809-40f4-b887-6a31efd81f6e","title":"Choose right accounts","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"4b721437-85db-4ca5-8a4c-e1a54affad85","title":"Clear up acne","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"5f0d4198-761d-4617-a3d7-e65a833d7e4b","title":"Coach youth sports","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"d08a7dde-e7fe-42e8-af4e-752cef7a7355","title":"Complete a marathon","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"23047783-3dc3-42f6-8b40-c1dd37a4693e","title":"Complete daily priorities","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"2f6e70d0-2985-46b4-8bbe-a7d650133faf","title":"Compost","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"335540d0-314b-41a0-a50d-d693f828dd72","title":"Consolidate debts","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"1a9d7daf-5e18-4ea2-bfae-6b439ebdef2c","title":"Control acid reflux","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"0bf5187f-21cd-4e73-a349-dc1f46dbabef","title":"Control allergies","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"d7c3a613-c5fe-4aba-bc68-78b221f07f3d","title":"Control blood sugar","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"58a68e71-19ae-40c0-92c3-5844870c410b","title":"Control compulsive shopping","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"0ba6a398-8a4b-4b08-b43c-5ae04f0ec608","title":"Control gaming addiction","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"2633f500-9b34-449a-bb87-9dce0d203a31","title":"Control inflammation","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"659e0530-f38f-4472-9320-1082337de090","title":"Control my drinking","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"91db190f-4fd5-4091-ab9d-3a88c73bb233","title":"Control my temper","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"c017b79a-30c7-4f72-90f2-4aff05eea0f9","title":"Control OCD behaviors","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"ef3ff425-3d80-4689-b9a9-c542d580254d","title":"Control oily skin","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"25988abd-7991-4b30-9bf1-9af3e43ebfd3","title":"Control sugar cravings","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"dd761c23-9b37-4f60-b9bc-7f1a27eb9cdb","title":"Cope with PTSD","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"de6acfda-88c6-4fbe-873a-a4d931c75d89","title":"Cover gray hair","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"90700d46-1013-41eb-ab06-8a66abdd6286","title":"Create a budget","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"e9569309-a911-4045-a416-a74827827c7c","title":"Create good habits","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"75f672d2-518a-4587-b8b5-b2914d9ed3ba","title":"Create will/estate plan","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"f54b624a-33d1-4ad2-8de5-15b6d458e2bc","title":"Date after divorce","arena_id":"bd45696d-0be1-498b-a8d2-4bbaa9e5206b"},
  {"id":"4dbf47c6-8077-4441-a536-9d459c2436b2","title":"Deal with body odor","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"c06ce272-50b1-424d-ac13-fade70b170b6","title":"Deal with excessive sweating","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"9ece109e-ccc4-4010-b4ae-b216074843dd","title":"Deal with hair loss","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"668a9ad9-8748-443c-ac4b-4eef8ee0c70d","title":"Deal with rosacea","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"1331079c-b7d7-4196-91b8-5c9aece78ac1","title":"Deal with tinnitus","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"4aedae73-e27d-4ed0-b261-1e725c494abb","title":"Develop growth mindset","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"d6f8f5df-c34b-4239-b978-18d702f5936a","title":"Develop morning routine","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"5ceb513d-b531-4e35-ad74-221cb6dff539","title":"Develop perseverance","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"d8ea6191-431a-4629-8609-3ef21c0f53e0","title":"Develop social ease","arena_id":"6ce23046-c80c-4885-8658-256f58a59c3d"},
  {"id":"3aa0902d-a5bd-4d6e-aaff-767a826b13a5","title":"Do a pull-up","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"06055c70-39d2-4a95-9347-b7bd9696041e","title":"Drink more water","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"8e859cbe-1a95-4d5d-b494-888fe85d9374","title":"Entertain on budget","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"684b6862-cce5-49dd-9b1a-9f1703d76bd3","title":"Even out skin tone","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"789c75b4-daf7-4a80-96c2-8dc2c0875fbc","title":"Express emotions healthily","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"c833eca2-b877-46fc-9728-102e2c282904","title":"Fade scars and marks","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"4bc9eecd-0815-46a8-812f-5745ae369b3e","title":"Fall asleep faster","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"cf23e088-e507-4160-a5bb-92152f445e78","title":"Find causes I care about","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"18b9a15c-0da1-4ad4-b122-7c32de779d6e","title":"Find exercise I enjoy","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"7f10f31f-5ba4-4be7-a2c0-d4d244f7aa94","title":"Find job openings","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"d8855dce-d45b-4212-8ae5-19e12ec4ebb3","title":"Fix dry skin","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"99981e39-0c39-4806-867d-62d36b2230ec","title":"Follow through on commitments","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"f609b584-d74f-4b42-94a0-db56d1f32d3a","title":"Gain healthy weight","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"b20c1a4d-cedb-4913-8864-9b31ae612e07","title":"Get a sunless tan","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"0606e912-64a2-4276-8426-e11b90eef1b3","title":"Get glowing skin","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"49a8e45d-6732-4738-a705-5b9f35e3a184","title":"Get more dating matches","arena_id":"bd45696d-0be1-498b-a8d2-4bbaa9e5206b"},
  {"id":"60c2201f-6e19-46f1-8314-7bff985af1f8","title":"Get out of debt","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"c826834a-bf7e-45d4-9888-7526b8d6cba2","title":"Get over dating anxiety","arena_id":"bd45696d-0be1-498b-a8d2-4bbaa9e5206b"},
  {"id":"417d36d6-a456-46ab-bf73-85fa8a32bc50","title":"Get proper insurance","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"fec1af39-041c-4fab-ae59-d827fc09063b","title":"Get second dates","arena_id":"bd45696d-0be1-498b-a8d2-4bbaa9e5206b"},
  {"id":"723f006e-10fa-4c09-9270-927915a46037","title":"Get stronger","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"979cd4a1-ca35-4e20-aa7a-baf390264a6f","title":"Get to ideal weight","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"23f16afa-0166-44c5-94ce-00797409ed92","title":"Get toned body","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"6436959e-8859-46e8-af4a-139484b6f966","title":"Give back effectively","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"51daef31-1271-4128-ad38-11c686598e07","title":"Grow thicker hair","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"2f8b2a3e-ec14-4ac3-9fd4-faf9effe970a","title":"Handle job uncertainty","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"ed1f08b5-1e65-447c-a3af-e4f6e594a7ab","title":"Handle social rejection","arena_id":"6ce23046-c80c-4885-8658-256f58a59c3d"},
  {"id":"cea54b7e-3d17-47f4-964a-e8e4cd06d116","title":"Have a flatter stomach","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"111adb63-1916-48d4-9599-4b074c10f894","title":"Have healthier hair","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"54101067-5731-4744-9b47-ce95f90a62b5","title":"Have healthy nails","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"965430b3-6caf-489a-8be3-fc7930951198","title":"Heal from heartbreak","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"1f467a6d-a3be-48dd-a763-049166d9a15f","title":"Help those in need","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"34a3de93-f47c-4167-8ae3-e3db3a3f40d6","title":"Host confidently","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"43d81f73-c2b4-4c5d-9ee0-ea44e7d2c5ae","title":"Improve balance","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"f5dd1ba0-7141-4e74-a036-42ea76c01f3a","title":"Improve emotional regulation","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"cf920463-3968-4813-815f-613ad1c48926","title":"Improve flexibility","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"bc0e64fb-56e1-4b30-a9e8-3b80e90f650f","title":"Improve heart health","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"a865f143-eec8-4e00-9300-4c34910a933b","title":"Improve home lighting","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"c156fc35-fd76-4d7f-a253-59105975b58c","title":"Improve posture","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"b279c24b-2032-425d-989e-105bd59240e1","title":"Keep conversations going","arena_id":"bd45696d-0be1-498b-a8d2-4bbaa9e5206b"},
  {"id":"6bbadd73-26d7-4e75-9248-9db7c8599e21","title":"Keep plants thriving","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"a660050e-780c-44c8-be6a-1cfdfeaaf82d","title":"Land dream job","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"1723df8a-dd75-4c99-8b63-29c24e36d89f","title":"Learn an instrument","arena_id":"d33f04f1-c32a-481c-88f7-aa4d65203516"},
  {"id":"9c5ecdf7-b473-489b-9c98-866a03417710","title":"Learn new skills","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"eebc1755-2d21-484c-ab4d-59eb86ac0143","title":"Learn pottery","arena_id":"d33f04f1-c32a-481c-88f7-aa4d65203516"},
  {"id":"8b6c106c-dc95-4367-b5a2-1578a3775d35","title":"Learn self-defense","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"82d7b9f1-fda0-435d-b982-d1975c75dbbf","title":"Learn to code","arena_id":"2b1ec154-512f-4314-a415-f39171e54898"},
  {"id":"e4b12be3-9570-46d1-8b0b-dbc3f2a48fe6","title":"Learn to draw","arena_id":"d33f04f1-c32a-481c-88f7-aa4d65203516"},
  {"id":"1f5a3dba-9aad-4c0a-932b-7657a3842b40","title":"Learn to paint","arena_id":"d33f04f1-c32a-481c-88f7-aa4d65203516"},
  {"id":"10ca44ca-6797-43a9-bcc6-be80d2858c8d","title":"Learn to use AI tools","arena_id":"2b1ec154-512f-4314-a415-f39171e54898"},
  {"id":"28a9df62-1511-4d0a-aebc-3b8d303f33d4","title":"Leave toxic situation","arena_id":"0502f3ff-fd7d-4fb5-ade0-58bc256978bc"},
  {"id":"1be300b4-6945-45c0-946e-934f1443053e","title":"Lift heavier weights","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"f053571e-8118-44a4-a5c2-c3cd49a08a69","title":"Look fit in clothes","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"bf74d2f1-3c7e-43b4-bf93-748afec276e9","title":"Look put together","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"5c398aef-3019-4d41-a5cb-9dedaacda4ab","title":"Lose weight sustainably","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"a2f36f44-eef3-4ecb-8558-18015468c04a","title":"Lower blood pressure","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"f36c91a3-bb0f-4cd4-906c-337e3d8a5f3c","title":"Maintain deep focus","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"a198e840-8672-4c58-99fa-51245a5492d5","title":"Maintain home value","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"1187609c-fca9-4793-8ca5-3fc34ecfaf78","title":"Make guests comfortable","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"bfdedb5e-b7d1-4dc8-b2ff-30cda27d6eb8","title":"Manage ADHD symptoms","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"13a6540f-d793-4007-ba52-b964e35e89ee","title":"Manage autoimmune conditions","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"d5f5b5c7-12d0-49ec-97be-5e97ce51a9ad","title":"Manage business finances","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"3a8eae50-6c90-4fce-b069-156862871cfe","title":"Manage chronic fatigue","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"dcb86734-1bbc-4ab0-8ffb-b82d75fdcd64","title":"Manage chronic pain","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"98195b10-f901-4fa5-9ec1-a42b293eaed3","title":"Manage depression symptoms","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"bbe1b334-f430-4722-b994-1916341d3e1a","title":"Manage eczema/psoriasis","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"8747b8d3-96ff-42cf-8b9f-70a3c27a90c7","title":"Manage fibromyalgia","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"d6ac7810-8b70-4c72-b23d-b33da6eb3fb5","title":"Manage frustration without outbursts","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"db8a2938-5fe7-48b4-bb95-5b97747f91d7","title":"Manage IBS and gut issues","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"ca9d28b4-ad04-4a0c-9cbd-5bdf9699968f","title":"Manage PCOS","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"867d2275-157c-4b2c-8160-c8d3b8e641fe","title":"Manage seasonal depression","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"affe3528-b5bd-4a3f-a755-37cfba95335e","title":"Manage sensitive skin","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"00c29c5e-4dd3-4462-890a-d8d04d1196b1","title":"Manage thyroid issues","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"31b43af1-fb4d-4c27-bb97-91ba77c3e02e","title":"Manage vertigo and dizziness","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"f182860d-f579-4704-9bc6-42ebcec532f5","title":"Master everyday hairstyling","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"84dd439a-19c9-4a2d-ac3d-bd268d90c963","title":"Master makeup basics","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"0f025c14-a321-4579-b47c-6eb01ec800e1","title":"Master phone photography","arena_id":"d33f04f1-c32a-481c-88f7-aa4d65203516"},
  {"id":"2dfb4085-c5f3-484f-868f-062abb371077","title":"Mentor young people","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"96cad06d-1aa6-4f24-89b8-f1901bd10c5d","title":"Minimize pores","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"e049b4c5-6d7c-4988-b205-b6f24d1362fd","title":"Navigate autism challenges","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"bbfa8698-398c-40e6-8bf5-c7dce0104c77","title":"Navigate insurance options","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"552e81a6-7580-4956-a0cb-8893ce9e55b7","title":"Navigate menopause","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"d652351e-6a68-4940-b79b-8e62d9f86588","title":"Network effectively","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"a409f987-6ab6-4e6f-b657-85b26901d562","title":"Overcome drug abuse","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"b640da48-e674-4e7d-a335-8ea29b7cb22d","title":"Overcome eating disorders","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"a1bc5222-9eac-475f-b646-be07b9e052fa","title":"Pay off credit cards","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"148cf4b8-c1fc-4cdb-81a1-56d62593386f","title":"Plan for emergencies","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"888693d9-7498-410b-ac31-cea63ee12078","title":"Plan for healthcare costs","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"6016ad82-8b88-4776-9da9-e609e61d96a7","title":"Plan for long-term care","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"39790d9d-9cb3-4fda-8851-9105ad8ac7cf","title":"Practice meditation","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"e6ddd417-0e78-4f20-a043-08a7de10c801","title":"Practice mindfulness","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"7b0d1a0a-f65a-41d9-b1cd-afedf41d52b9","title":"Practice self-compassion","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"97b7334e-74c7-44ff-a8c0-fc9643fb3789","title":"Prepare for baby","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"0bceed44-3db4-4c7b-9ed4-3286ee4008b0","title":"Prepare for job loss","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"287d5b7e-4fc2-40c3-94f2-500d120bc522","title":"Prevent injuries","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"bf4e99ad-7afa-46f0-aab6-627a03649c64","title":"Prioritize effectively","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"cfc96452-e4b1-47e2-a286-8d1d834b2af7","title":"Quiet racing mind","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"6e15bc27-d903-4126-ac8c-1720f99ab561","title":"Quit drinking","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"b41d3f03-a5f4-4a91-8a59-951fa97f82a8","title":"Quit marijuana dependency","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"74ba0f3b-8dd8-445b-9a3b-f74271daf504","title":"Quit smoking","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"cf73ce7b-8e8f-40aa-908c-6900209878a0","title":"Quit vaping","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"90484cf6-5e0b-4a49-b129-ff205f1aad6f","title":"Read more books","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"56e2801e-0d78-4abd-a795-869e5b780ae7","title":"Reduce anxiety","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"8616f324-f280-4902-be87-87aa7122f1f8","title":"Reduce dark circles","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"35483ae2-65df-434a-a2ef-ab563e48cea9","title":"Reduce household expenses","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"915e6f73-dce8-4b1d-8443-5d95d002d097","title":"Reduce household waste","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"769a0120-666e-4713-a988-16ed49516158","title":"Reduce joint pain","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"fd3be08f-54a8-4f4f-81f6-1ece40895b15","title":"Reduce social media use","arena_id":"2b1ec154-512f-4314-a415-f39171e54898"},
  {"id":"104d626b-eba7-4452-96e3-9cdc872e643f","title":"Relax in social settings","arena_id":"6ce23046-c80c-4885-8658-256f58a59c3d"},
  {"id":"f0583121-dbd5-4ebe-87c3-f8fbc1f6d13c","title":"Remember names and faces","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"0cbdcf5f-a24a-46ce-b0f2-03d2d6651c72","title":"Remove age spots","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"32d14d31-6384-459b-9de8-a6a436b8ff03","title":"Remove unwanted hair","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"d76a03d4-27fb-4d52-960f-2791898e42d6","title":"Respond not react","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"6ea319a6-88a1-4e98-8cf2-9c04ef260ed7","title":"Return after maternity/leave","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"765ac51f-ca85-4d01-8711-77041fc2aedd","title":"Run my first 5K","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"4a3acbc1-9ba5-430b-9ac8-d0fd53810e88","title":"Save for house","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"af1e1baf-3379-43aa-a2be-6cf621d35bd6","title":"Save money consistently","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"b682e7c6-4ed9-4b54-98ec-b6c84bda73d4","title":"Save on utilities","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"64dedad8-83f2-41f4-af75-8af1f0a24e73","title":"Set social boundaries","arena_id":"6ce23046-c80c-4885-8658-256f58a59c3d"},
  {"id":"fe5c92b9-574a-4f73-940b-f312be38c181","title":"Share opinions confidently","arena_id":"6ce23046-c80c-4885-8658-256f58a59c3d"},
  {"id":"2869fdad-5412-44d6-99a4-bd6ba736139b","title":"Shop smarter for home","arena_id":"f9cddd14-c617-48ad-aa1a-f75a8f105b3a"},
  {"id":"d46ce9bb-3d80-4d94-b402-8d389e27781f","title":"Sleep better","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"e8fe3af7-49b9-4a54-8466-ca4775c37884","title":"Spot layoff signs","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"6be41ee3-9d04-4aad-a43d-6672c90964ad","title":"Stand out from applicants","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"e783dbdf-c1c7-43a3-9751-06ab573240e5","title":"Start exercising regularly","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"ce72cfad-9062-4e86-acad-d9a0bec51acc","title":"Start grassroots movement","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"fc4cebae-2920-4b10-b89b-dcfa5ccc4f7d","title":"Start investing","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"1e792f27-966f-4968-bae4-c84c84989fed","title":"Start journaling","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"e416cef3-ff8a-4bc1-a467-8cab2855344e","title":"Start over at 40+","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"8227b511-30b7-48b5-a482-1ba46a15af9d","title":"Start side business","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"91f8cf27-c3f2-47af-ad88-c39ccaea72d4","title":"Start side hustle","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"41c58331-a79f-406b-a049-1abd1f8c4d6f","title":"Start support groups","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"01a258a6-2414-4a12-a79d-4c58d090aabe","title":"Start writing regularly","arena_id":"d33f04f1-c32a-481c-88f7-aa4d65203516"},
  {"id":"0bfa9bd6-794a-4663-9262-9f2aa640f34e","title":"Start yoga practice","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"eddd32ce-f951-4232-a80f-f1a80ec50f96","title":"Stay flexible as I age","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"091e4035-81cf-4bbf-bd75-ebbeff6cab47","title":"Stay indispensable","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"9522f755-f58a-4b4b-bd24-c154166a8d05","title":"Stop abusing painkillers","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"016eebd2-5cb4-4e10-ba6e-1483aae4dc87","title":"Stop breakouts","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"2755c4b7-7156-429e-89e9-55dca536c474","title":"Stop doomscrolling","arena_id":"2b1ec154-512f-4314-a415-f39171e54898"},
  {"id":"e6de646e-9a2d-4935-a785-df4dc098684d","title":"Stop emotional eating","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"fd47e075-e2e3-4f83-8f05-096bfa7585d3","title":"Stop emotional exhaustion","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"2c2be634-4586-4b4b-8da8-b1a2795eb3bc","title":"Stop gambling","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"0f89cae2-cc94-47ef-ab16-1ad45a79b746","title":"Stop insomnia","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"f7c595e0-b4bf-42ee-b93e-31cf6222c5c2","title":"Stop junk food binges","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"712a1cd8-0a7b-4530-9711-d4ebff42243f","title":"Stop losing it","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"823cb2dc-1b96-4f64-8de8-2ee71974ba08","title":"Stop migraines","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"580ab7cb-63ae-4234-9fe4-b7e0f0fe7d9c","title":"Stop news addiction","arena_id":"2b1ec154-512f-4314-a415-f39171e54898"},
  {"id":"5a6203f4-f94f-4b2f-9e12-e980e908f0f7","title":"Stop overspending","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"47a38ad8-447a-448e-868a-abedfcaa8743","title":"Stop procrastinating","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"a5169243-f97b-4cc7-98ce-79c2a5ac9997","title":"Stop self-harm","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"86794c43-865c-41aa-a51f-8ea77699aba1","title":"Stop yo-yo dieting","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"27cf196e-c0d2-461b-94b2-89f6143f189b","title":"Study philosophy","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"9b2827a2-09df-40c0-8c64-e2bc998c55ec","title":"Support education","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"a0473f4c-8367-45e3-9d43-ef99858a95b7","title":"Support refugees and immigrants","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"be505954-61b9-46b1-81ec-3c7ca0fefde0","title":"Support youth programs","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"dca1334b-c2b4-417c-a880-43a7c5a39081","title":"Swim regularly","arena_id":"b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b"},
  {"id":"45ececcb-85ed-4537-8206-4b5c541d050e","title":"Think more positively","arena_id":"b09902f6-38dc-4bf1-bd74-51283feece1c"},
  {"id":"18fad592-e777-403d-b9b6-e9eca1e98fc2","title":"Tone my body","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"97fe516b-0d28-40a4-9fbb-221e00c31d1d","title":"Track all expenses","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"e8849402-8d41-48a9-9497-bb0ac1be433f","title":"Track spending","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"77682cc2-1fc5-4781-a1db-e8bc10834e10","title":"Treat wrinkles","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"28ee14b7-fab1-46d3-82c5-54b1004e2fe7","title":"Understand cryptocurrency","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"9cbd3fad-755f-450f-8f45-a822955ab89b","title":"Understand investing","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"02cdeb6e-d240-4189-9637-f020d0827287","title":"Understand personal finance basics","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"d920d47a-4e2d-4499-9893-3e110fc04a23","title":"Understand taxes","arena_id":"8d4f91b5-d065-4636-be83-2bfdb397ca11"},
  {"id":"9f8f2896-177e-4414-b37a-d4345f5a22ea","title":"Update my wardrobe","arena_id":"f4c44a71-8ff6-4015-a994-bf0d67842911"},
  {"id":"16bbe856-4eae-45f7-ae3f-2bec6185d351","title":"Update outdated skills","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"fcbd935e-6531-4bd2-8410-7077674c65a5","title":"Use skills for good","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"749d9acb-b15a-4d27-993e-a9ac5fc71319","title":"Volunteer meaningfully","arena_id":"1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19"},
  {"id":"27f38396-bd04-4d86-9af8-5a7a8240c2ae","title":"Worry less","arena_id":"be32e097-e327-4746-ba0a-ce01bbe6cc55"},
  {"id":"94a5d0ef-fae8-4cb1-bbfa-d6a3bd8dec14","title":"Write compelling resume","arena_id":"f640ffc1-5e44-4f40-a6a5-474522d798ad"},
  {"id":"3799465a-aa48-4185-99da-459ec40579ec","title":"Write music","arena_id":"d33f04f1-c32a-481c-88f7-aa4d65203516"}
];

// Normalize WWFM goal titles
function normalizeWWFMGoal(title: string): string {
  let normalized = title.toLowerCase().trim();
  // Simple normalization - remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ');
  return normalized;
}

// Calculate similarity score
function calculateSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;
  if (s1 === s2) return 1.0;

  // Check containment
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }

  // Word overlap similarity
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// Main comparison function
function compareGoals() {
  console.log('Starting WWFM gap analysis...\n');

  const baseDir = '/Users/jackandrews/Desktop/wwfm-platform/human_endeavor';

  // Load top 300 scored goals
  const scoredGoalsPath = path.join(baseDir, 'processed', 'all_goals_scored.json');
  const allScoredGoals: ScoredGoal[] = JSON.parse(fs.readFileSync(scoredGoalsPath, 'utf-8'));
  const top300 = allScoredGoals.slice(0, 300);

  console.log(`Loaded ${top300.length} top internet goals`);
  console.log(`Loaded ${WWFM_GOALS.length} existing WWFM goals\n`);

  // Normalize WWFM goals
  const normalizedWWFM = WWFM_GOALS.map(g => ({
    ...g,
    normalized: normalizeWWFMGoal(g.title)
  }));

  // Compare each top goal against WWFM
  const analysis: GapAnalysis[] = [];

  for (let i = 0; i < top300.length; i++) {
    const goal = top300[i];
    let bestMatch: { goal: string; score: number } | undefined;

    // Find best matching WWFM goal
    for (const wwfmGoal of normalizedWWFM) {
      const similarity = calculateSimilarity(goal.normalized, wwfmGoal.normalized);

      if (!bestMatch || similarity > bestMatch.score) {
        bestMatch = { goal: wwfmGoal.title, score: similarity };
      }
    }

    // Classify match quality
    let status: 'covered' | 'partial' | 'gap' = 'gap';
    if (bestMatch && bestMatch.score >= 0.75) {
      status = 'covered';
    } else if (bestMatch && bestMatch.score >= 0.5) {
      status = 'partial';
    }

    analysis.push({
      rank: i + 1,
      goal: goal.normalized,
      score: goal.score,
      sources: goal.sources,
      wwfmMatch: bestMatch?.goal,
      matchScore: bestMatch?.score,
      status
    });
  }

  // Generate statistics
  const covered = analysis.filter(a => a.status === 'covered').length;
  const partial = analysis.filter(a => a.status === 'partial').length;
  const gaps = analysis.filter(a => a.status === 'gap').length;

  console.log('Gap Analysis Results:');
  console.log(`  ✅ Covered (75%+ match): ${covered} goals (${((covered/300)*100).toFixed(1)}%)`);
  console.log(`  ⚠️  Partial (50-75% match): ${partial} goals (${((partial/300)*100).toFixed(1)}%)`);
  console.log(`  ❌ Gaps (<50% match): ${gaps} goals (${((gaps/300)*100).toFixed(1)}%)\n`);

  // Save full analysis
  const analysisPath = path.join(baseDir, 'gap_analysis.txt');
  let report = `WWFM GAP ANALYSIS - Top 300 Internet Goals vs Existing WWFM Goals
Generated: ${new Date().toISOString()}

SUMMARY
=======
Total Goals Analyzed: 300
✅ Covered (75%+ similarity): ${covered} (${((covered/300)*100).toFixed(1)}%)
⚠️  Partial (50-75% similarity): ${partial} (${((partial/300)*100).toFixed(1)}%)
❌ Gaps (<50% similarity): ${gaps} (${((gaps/300)*100).toFixed(1)}%)

GAPS - HIGH-PRIORITY ADDITIONS (Score 5+)
==========================================\n\n`;

  const highPriorityGaps = analysis.filter(a => a.status === 'gap' && a.score >= 5);
  highPriorityGaps.forEach(a => {
    report += `${a.rank}. ${a.goal}\n`;
    report += `   Score: ${a.score} | Sources: ${a.sources.join(', ')}\n`;
    report += `   Closest WWFM: "${a.wwfmMatch}" (${((a.matchScore || 0) * 100).toFixed(0)}% match)\n\n`;
  });

  report += `\nMEDIUM-PRIORITY GAPS (Score 3-4)
====================================\n\n`;

  const mediumPriorityGaps = analysis.filter(a => a.status === 'gap' && a.score >= 3 && a.score < 5);
  mediumPriorityGaps.forEach(a => {
    report += `${a.rank}. ${a.goal} (Score: ${a.score})\n`;
  });

  report += `\nPARTIAL MATCHES - CONSIDER REFINEMENT
======================================\n\n`;

  const partialMatches = analysis.filter(a => a.status === 'partial' && a.score >= 5);
  partialMatches.forEach(a => {
    report += `${a.rank}. "${a.goal}" → WWFM has "${a.wwfmMatch}" (${((a.matchScore || 0) * 100).toFixed(0)}% match)\n`;
  });

  fs.writeFileSync(analysisPath, report);
  console.log(`Saved gap analysis to: ${analysisPath}\n`);

  // Save top 50 recommendations
  const recommendationsPath = path.join(baseDir, 'recommendations.txt');
  let recommendations = `TOP 50 RECOMMENDED GOAL ADDITIONS FOR WWFM
Based on search popularity and gap analysis

METHODOLOGY
===========
- Analyzed top 300 most-searched human goals from 2024-2025
- Compared against 228 existing WWFM goals
- Prioritized gaps with highest search confidence scores
- Only goals with <50% similarity to existing WWFM goals

HIGH-PRIORITY ADDITIONS (Missing entirely, high search volume)
==============================================================\n\n`;

  const topGaps = analysis.filter(a => a.status === 'gap').slice(0, 50);
  topGaps.forEach((a, i) => {
    recommendations += `${i + 1}. ${a.goal}\n`;
    recommendations += `   Rank: #${a.rank} | Score: ${a.score} | Sources: ${a.sources.join(', ')}\n\n`;
  });

  fs.writeFileSync(recommendationsPath, recommendations);
  console.log(`Saved top 50 recommendations to: ${recommendationsPath}\n`);

  // Save JSON version for potential programmatic use
  const jsonPath = path.join(baseDir, 'processed', 'gap_analysis.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    summary: { covered, partial, gaps, total: 300 },
    highPriorityGaps,
    mediumPriorityGaps,
    topGaps: topGaps.slice(0, 50),
    fullAnalysis: analysis
  }, null, 2));
  console.log(`Saved JSON analysis to: ${jsonPath}\n`);

  return { covered, partial, gaps, topGaps };
}

// Run comparison
try {
  const results = compareGoals();
  console.log('✅ Gap analysis complete!');
  console.log(`\nNext Steps:`);
  console.log(`- Review top ${results.topGaps.length} recommended additions`);
  console.log(`- Consider refining partial matches`);
  console.log(`- Prioritize based on WWFM's strategic focus`);
} catch (error) {
  console.error('Error during comparison:', error);
  process.exit(1);
}
