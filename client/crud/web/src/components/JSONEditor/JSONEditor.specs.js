import {JSONEditor} from "./JSONEditor";
import {RenderObject} from "./RenderObject";
import {RenderTree} from "./RenderTree";
import {EditableField} from "./EditableField";
import {each} from 'lodash';

describe('JSONEditor', () => {

    describe('renders', () => {

        it('should render an object', () => {
            const mWrapper = mount(<JSONEditor obj={{ a: 5 }}/>);

            expect(mWrapper).to.containMatchingElement(<RenderObject obj={{ a: 5}}/>);
            expect(mWrapper).to.containMatchingElement(<RenderTree obj={5}/>);
        });

        it('should render recursively', () => {
            const mWrapper = mount(<JSONEditor obj={{ a: { b: 5 }}}/>);
            expect(mWrapper).to.containMatchingElement(<RenderObject obj={{ a: { b: 5 }}}/>);
            expect(mWrapper).to.containMatchingElement(<RenderObject obj={{ b: 5 }}/>);
            expect(mWrapper).to.containMatchingElement(<RenderTree obj={5}/>);
        });

    });


    describe('updates', () => {

        const types = {
            number: [123, 31.32],
            boolean: [true, false],
            string: ["hello", '"goodbye"']
        };

        each(types, ([val1, val2], type) => {
            it(`should update a ${type} field`, () => {

                const obj = { a: val1 };
                const mWrapper = mount(<JSONEditor obj={obj}/>);
                expect(mWrapper).to.containMatchingElement(<RenderObject obj={{ a: val1}}/>);
                expect(mWrapper).to.containMatchingElement(<RenderTree obj={val1}/>);

                mWrapper.find(EditableField).filterWhere(el => el.text() === JSON.stringify(val1)).simulate('click');
                mWrapper.find('input').simulate('change', { target: { value: JSON.stringify(val2) }});
                mWrapper.find('form').simulate('submit');

                expect(obj.a).to.equal(val2);
            });
        });

        it('should delete a boolean field', () => {

            const obj = { a: true };
            const mWrapper = mount(<JSONEditor obj={obj}/>);

            // global.mWrapper = mWrapper;

            mWrapper.find('button')
                .filterWhere(el => el.text() === 'X')
                .simulate('click');

            expect(obj.a).to.be.undefined;

        });

        it('should delete a deep field', () => {

            const obj = {
                field: 123,
                otherObject: {
                    a: true,
                    b: false,
                    c: [1, 2, 3, "delete this"]
                }
            };

            mount(<JSONEditor obj={obj}/>)
                .find(RenderTree)
                .filter({ obj: "delete this" })
                .find('button')
                .filterWhere(el => el.text() === 'X')
                .simulate('click');

            expect(obj.otherObject.c[3]).to.be.undefined;

        });

        it('should delete an object', () => {

            const obj = {
                field: 123,
                otherObject: {
                    a: true,
                    b: false,
                    c: [1, 2, 3, "delete this"]
                }
            };

            mount(<JSONEditor obj={obj}/>)
                .find(RenderTree)
                .filter({ obj: obj.otherObject })
                .find('button')
                .filterWhere(el => el.text() === 'X')
                .first()
                .simulate('click');

            expect(obj.otherObject).to.be.undefined;

        });

    });


    describe('add new field', () => {

        it('should be able to rename the key of a field', () => {

            const obj = {
                somekey: 123
            };

            const wrapper = mount(<JSONEditor obj={obj}/>);

            wrapper.find('span')
                .filterWhere(el => el.text() === 'somekey')
                .simulate('click');

            wrapper.find('input')
                .simulate('change', { target: { value: 'newkey' } });

            wrapper.find('form')
                .simulate('submit');

            expect(obj.newkey).to.equal(123);
            expect(obj.somekey).to.be.undefined;

        });


        it('should have a (+) button', () => {

            const wrapper = mount(<JSONEditor obj={{ a: 5 }}/>);

            wrapper.find('button')
                .filterWhere(el => el.text() === '+')
                .simulate('click');

        });


        it('should have two consecutive inputs to create a new field', () => {

            const obj = {};

            const wrapper = mount(<JSONEditor obj={obj}/>);

            wrapper.find('button')
                .filterWhere(el => el.text() === '+')
                .simulate('click');

            wrapper.find('input')
                .simulate('change', { target: { value: 'keyname' } });

            wrapper.find('form')
                .simulate('submit');

            wrapper.find('input')
                .simulate('change', { target: { value: '51' } });

            wrapper.find('form')
                .simulate('submit');

            expect(obj.keyname).to.equal(51);

        });

        it('should not create a new field if the user enters invalid key/json', () => {

            const obj = {};

            const wrapper = mount(<JSONEditor obj={obj}/>);

            wrapper.find('button')
                .filterWhere(el => el.text() === '+')
                .simulate('click');

            wrapper.find('input')
                .simulate('blur');

            expect(obj).to.be.empty;

            wrapper.find('button')
                .filterWhere(el => el.text() === '+')
                .simulate('click');

            wrapper.find('input')
                .simulate('change', { target: { value: 'keyname' } });

            wrapper.find('form')
                .simulate('submit');

            wrapper.find('input')
                .simulate('blur');

            expect(obj).to.be.empty;

        })

    });

});