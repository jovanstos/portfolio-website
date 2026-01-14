import ZiplineApp from "./ZiplineApp";
import "../styles/Project.css";

function Zipline() {

    return (
        <main id="project">
            <h1>Zipline</h1>
            <p style={{ marginBottom: "15px" }}>An app for sharing text and files between two devices, but with encryption!</p>
            <ZiplineApp />
            {/* <section className="project-content">
                {contentData?.map((articleData: any) => {
                    const hasText = Boolean(articleData.text);
                    const hasImage = Boolean(articleData.imageurl);

                    return (
                        <FadeInSection>
                            <article className="project-article" key={articleData.id}>
                                {hasImage && (
                                    <>
                                        <h2 className="project-h2">{articleData.title}</h2>
                                        <img
                                            src={articleData.imageurl}
                                            alt={articleData.imagedescription || ""}
                                            width={750}
                                        />
                                        <p style={{ textAlign: "center" }}>{!hasText ? articleData.imagedescription : ""}</p>
                                    </>
                                )}
                                {hasText && <p>{articleData.text}</p>}
                            </article>
                        </FadeInSection>
                    );
                })}
            </section> */}
        </main>
    );
}

export default Zipline;
