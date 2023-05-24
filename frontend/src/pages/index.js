import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import ExpCardGrid from '@/components/ExpCardGrid'
import Header from "@/components/Header";
import React, { useState, useEffect } from 'react';

export async function getServerSideProps() {
  const res = await fetch('https://travel-planner-production.up.railway.app/LatestExp');
  // const res = await fetch('http://127.0.0.1:5001/LatestExp');
  const data = await res.json();
  console.log(data.data, 'DATA')

  return {
    props: {
      experience: data.data,
    },
  };
}

export default function Home({ user, experience }) {

  return (
    <>
      <Head>
        <title>Travel Planner</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>

        <div className={styles.top}>
          <div className={styles.HomePicContainer} >
            <Image
              className={styles.HomePic}
              src="https://firebasestorage.googleapis.com/v0/b/travelapp-9e26b.appspot.com/o/Balloons-Over-ABQ-LR2.jpg.webp?alt=media&token=3a9ef041-cbe2-4bc7-a4b3-c4d6f921b001"
              quality={100}
              style={{ borderRadius: '20px', opacity: '0.9' }}
              fill
            />
            <div className={styles.HeaderContainer}>
              <Header user={user} />
            </div>
          </div>
        </div>

        <h3 className={styles.subheader}>
          Latest Experiences
        </h3>
        <div>
          <ExpCardGrid data={experience} />
        </div>
      </main>
    </>
  )
}
