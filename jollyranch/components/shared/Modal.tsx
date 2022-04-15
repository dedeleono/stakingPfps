import {FC, useEffect, useRef} from "react";
import { CSSTransition } from "react-transition-group";
import ReactPortal from "./ReactPortal";

interface ModalProps {
    children: object,
    isOpen: boolean,
    handleClose?: () => void,
}

const Modal: FC<ModalProps> = ({ children, isOpen, handleClose }) => {
    const nodeRef = useRef(null);
    useEffect(() => {
        if(handleClose) {
            const closeOnEscapeKey = (e:any) => (e.key === "Escape" ? handleClose() : null);
            document.body.addEventListener("keydown", closeOnEscapeKey);
            return () => {
                document.body.removeEventListener("keydown", closeOnEscapeKey);
            };
        }
    }, [!!handleClose && handleClose]);

    return (
        <ReactPortal wrapperId="react-portal-modal-container">
            <CSSTransition
                appear={isOpen}
                in={isOpen}
                timeout={{ exit: 0 }}
                unmountOnExit
                classNames={{
                    appearDone: 'modal-open',
                    enterDone: 'modal-open',
                }}
                nodeRef={nodeRef}
            >
                <div className="modal bg-neutral bg-opacity-50 backdrop-blur-sm  rounded-lg" ref={nodeRef}>
                    <div className="modal-box bg-primary-content px-3 md:px-6 ">
                        {!!handleClose && (
                            <div className="flex justify-end relative z-10">
                                <button onClick={handleClose} className="btn btn-circle btn-outline btn-sm	">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                        <div className="modal-content">{children}</div>
                    </div>
                </div>
            </CSSTransition>
        </ReactPortal>
    );
}
export default Modal;
